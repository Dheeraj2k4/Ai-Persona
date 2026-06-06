# Face Recognition Attendance System

**Repository:** https://github.com/Dheeraj2k4/Face_Recognition_Attendance_System
**Primary Languages:** Jupyter Notebook (85%), Python (15%)
**Year:** 2024

## Purpose
Full-stack attendance management application that uses real-time face detection and recognition to automate student attendance logging. Deployed as a web application on AWS EC2.

## Tech Stack
- **ML/CV:** InsightFace (ArcFace model), OpenCV
- **Frontend:** Streamlit (Python web framework)
- **Deployment:** AWS EC2
- **Database:** Local file-based storage (CSV/JSON)

## Architecture
1. **Registration:** Students register with photos → face embeddings computed via InsightFace
2. **Detection:** Live camera feed → face detection using RetinaFace
3. **Recognition:** Detected faces matched against registered embeddings (cosine similarity)
4. **Logging:** Matched students automatically marked present with timestamp
5. **Web Interface:** Streamlit provides registration, live feed, and attendance reports

## Design Tradeoffs
- **InsightFace over dlib/FaceNet:** Better accuracy on diverse faces, pretrained ArcFace model. Tradeoff: heavier model, slower inference.
- **Streamlit over Flask/React:** Rapid prototyping, Python-native, built-in camera widgets. Tradeoff: limited customization, not production-grade UI.
- **AWS EC2 over local:** Accessible from anywhere, demonstrates cloud deployment. Tradeoff: ongoing cost.
- **File-based storage over DB:** Simpler for prototype. Tradeoff: doesn't scale, no concurrent access safety.

## What I'd Do Differently
- Use a proper database (PostgreSQL) for attendance records
- Add anti-spoofing (liveness detection) to prevent photo attacks
- Implement batch registration from class photos
- Add notification system (email/SMS when student marked present)
- Containerize with Docker for reproducible deployment
- Use edge inference (ONNX Runtime) for faster processing

## Key Achievements
- Real-time face recognition pipeline working in browser
- Deployed and accessible on AWS EC2
- Eliminated manual attendance record keeping
- Handles multiple faces simultaneously
