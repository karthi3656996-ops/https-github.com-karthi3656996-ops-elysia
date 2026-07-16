import cv2
import mediapipe as mp
import numpy as np
import mediapipe.solutions.hands as mp_hands
import mediapipe.solutions.drawing_utils as mp_drawing
import mediapipe.solutions.drawing_styles as mp_drawing_styles

class HandLandmarkExtractor:
    def __init__(self, max_num_hands=2, min_detection_confidence=0.7, min_tracking_confidence=0.5):
        self.mp_hands = mp_hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=max_num_hands,
            model_complexity=1,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.mp_draw = mp_drawing
        self.mp_drawing_styles = mp_drawing_styles


    def extract_landmarks(self, frame_bgr):
        """
        Process a BGR frame, detect hands, extract and normalize landmarks.
        Returns:
            features: 126-dimensional list (63 for Right Hand, 63 for Left Hand)
            annotated_frame: Frame with overlaid landmarks
            detected: Boolean indicating if any hand was detected
        """
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        
        right_features = [0.0] * 63
        left_features = [0.0] * 63
        detected = False
        
        annotated_frame = frame_bgr.copy()
        
        if results.multi_hand_landmarks and results.multi_handedness:
            detected = True
            for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                # Draw landmarks on frame
                self.mp_draw.draw_landmarks(
                    annotated_frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing_styles.get_default_hand_landmarks_style(),
                    self.mp_drawing_styles.get_default_hand_connections_style()
                )
                
                # Extract classification label
                label = handedness.classification[0].label  # 'Left' or 'Right'
                
                # Extract & Normalize landmarks
                features = self._normalize_landmarks(hand_landmarks)
                
                # Assign to corresponding slot
                if label == 'Right':
                    right_features = features
                else:
                    left_features = features

        # Combine slots into 126-dimensional vector
        combined_features = right_features + left_features
        return combined_features, annotated_frame, detected

    def _normalize_landmarks(self, hand_landmarks):
        """
        Normalize 21 landmarks:
        1. Subtract wrist (landmark 0) from all landmarks for translation invariance.
        2. Scale landmarks by maximum distance from wrist for scale invariance.
        """
        coords = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark])
        
        # Translation: Make wrist the origin (0, 0, 0)
        wrist = coords[0]
        relative_coords = coords - wrist
        
        # Scale: Divide by maximum distance from wrist
        distances = np.linalg.norm(relative_coords, axis=1)
        max_dist = np.max(distances)
        
        if max_dist > 0:
            normalized_coords = relative_coords / max_dist
        else:
            normalized_coords = relative_coords
            
        return normalized_coords.flatten().tolist()
        
    def close(self):
        self.hands.close()
