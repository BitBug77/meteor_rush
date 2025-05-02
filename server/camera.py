import cv2

def test_camera(camera_index=0):
    print(f"Attempting to open camera at index {camera_index}")
    cap = cv2.VideoCapture(camera_index)
    
    if not cap.isOpened():
        print(f"Failed to open camera at index {camera_index}")
        return False
    
    print(f"Camera opened successfully with:")
    print(f"Resolution: {cap.get(cv2.CAP_PROP_FRAME_WIDTH)}x{cap.get(cv2.CAP_PROP_FRAME_HEIGHT)}")
    print(f"FPS: {cap.get(cv2.CAP_PROP_FPS)}")
    
    print("Displaying camera feed. Press 'q' to quit.")
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("Failed to grab frame")
            break
            
        # Display the resulting frame
        cv2.imshow('Camera Test', frame)
        
        # Break the loop when 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Release the capture and close windows
    cap.release()
    cv2.destroyAllWindows()
    return True

if __name__ == "__main__":
    # Try camera index 0 (default)
    if not test_camera(0):
        # If camera 0 fails, try camera 1
        print("\nTrying alternative camera...")
        test_camera(1)