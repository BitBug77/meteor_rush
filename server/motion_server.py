import asyncio
import json
import websockets
import cv2
import mediapipe as mp
import time
import argparse
import logging
import threading

# Logger setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MediaPipe hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Argument parser
parser = argparse.ArgumentParser(description="Hand Motion Detection Server")
parser.add_argument('--port', type=int, default=8765)
parser.add_argument('--camera', type=int, default=0)
parser.add_argument('--resolution', type=str, default='640x480')
parser.add_argument('--fps', type=int, default=30)
parser.add_argument('--jump-threshold', type=float, default=0.3)
parser.add_argument('--display', action='store_true')
parser.add_argument('--debug', action='store_true')

# Global flags
running = True
last_jump_time = 0
JUMP_COOLDOWN = 1.0

# Shared async values
processed_frame = None
display_frame = None
frame_available = asyncio.Event()
processing_complete = asyncio.Event()
action_queue = asyncio.Queue()

def detect_jump(hand_landmarks, threshold):
    global last_jump_time
    current_time = time.time()
    if current_time - last_jump_time < JUMP_COOLDOWN:
        return False

    wrist_y = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].y
    middle_y = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].y
    vertical_distance = middle_y - wrist_y

    if vertical_distance < -threshold:
        last_jump_time = current_time
        return True
    return False

def process_frame(frame, hands, threshold, show_display):
    if frame is None:
        return None, None

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)
    action = None

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            if show_display:
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            if detect_jump(hand_landmarks, threshold):
                action = {"action": "jump"}
    return frame, action

def display_thread_func():
    global display_frame, running
    logger.info("Display thread started")
    fps, frame_count, start_time = 0, 0, time.time()

    while running:
        if display_frame is not None:
            frame = display_frame.copy()
            frame_count += 1
            if frame_count >= 10:
                end_time = time.time()
                fps = frame_count / (end_time - start_time)
                frame_count, start_time = 0, time.time()
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow('Hand Gesture Control', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            running = False
            break
        time.sleep(0.01)

    cv2.destroyAllWindows()
    logger.info("Display thread stopped")

async def frame_processor(hands, threshold, show_display):
    global processed_frame, display_frame
    while running:
        await frame_available.wait()
        frame_available.clear()
        if processed_frame is not None:
            result_frame, action = process_frame(processed_frame, hands, threshold, show_display)
            if show_display and result_frame is not None:
                display_frame = result_frame
            if action:
                await action_queue.put(action)
        processing_complete.set()
        await asyncio.sleep(0.001)

async def frame_capture(cap, fps):
    global processed_frame
    while running:
        ret, frame = cap.read()
        if not ret:
            logger.warning("Camera read failed.")
            cap.release()
            await asyncio.sleep(0.5)
            continue

        await processing_complete.wait()
        processing_complete.clear()
        processed_frame = frame
        frame_available.set()
        await asyncio.sleep(1/fps)

async def handler(websocket):
    logger.info("Client connected")
    try:
        async def receive_loop():
            try:
                async for message in websocket:
                    logger.debug(f"Received from client: {message}")
            except:
                pass  # Client closed connection

        asyncio.create_task(receive_loop())

        while running:
            try:
                action = action_queue.get_nowait()
                await websocket.send(json.dumps(action))
                logger.info(f"Sent action: {action}")
            except asyncio.QueueEmpty:
                await websocket.send(json.dumps({"status": "idle"}))
            await asyncio.sleep(0.1)
    except websockets.exceptions.ConnectionClosed:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

async def main():
    global running
    args = parser.parse_args()
    if args.debug:
        logger.setLevel(logging.DEBUG)

    width, height = map(int, args.resolution.split('x'))
    cap = cv2.VideoCapture(args.camera)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    cap.set(cv2.CAP_PROP_FPS, args.fps)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    if not cap.isOpened():
        logger.error("Failed to open camera.")
        return

    processing_complete.set()

    hands = mp_hands.Hands(
        model_complexity=0,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    if args.display:
        display_thread = threading.Thread(target=display_thread_func, daemon=True)
        display_thread.start()
    else:
        display_thread = None

    logger.info(f"Server running on ws://localhost:{args.port}")

    async with websockets.serve(handler, "localhost", args.port):
        tasks = [
            asyncio.create_task(frame_capture(cap, args.fps)),
            asyncio.create_task(frame_processor(hands, args.jump_threshold, args.display))
        ]
        try:
            await asyncio.Future()  # Run forever
        except asyncio.CancelledError:
            logger.info("Shutting down...")
        finally:
            running = False
            for t in tasks:
                t.cancel()
            try:
                await asyncio.gather(*tasks, return_exceptions=True)
            except:
                pass
            hands.close()
            cap.release()
            if display_thread and display_thread.is_alive():
                display_thread.join(timeout=1.0)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")