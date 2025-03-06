import React, { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { useTestStore } from '../../store/testStore';
import Webcam from 'react-webcam';
import { AlertTriangle, Camera, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const DetectionService: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const incrementViolation = useTestStore(state => state.incrementViolation);

  useEffect(() => {
    let objectDetectionModel: cocoSsd.ObjectDetection | null = null;
    let faceDetector: faceDetection.FaceDetector | null = null;
    let isModelRunning = true;
    let animationFrameId: number;

    const initializeModels = async () => {
      try {
        if (!tf.getBackend()) {
          await tf.setBackend('webgl');
        }
        await tf.ready();
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640,
            height: 480,
            facingMode: 'user',
            frameRate: 30
          } 
        });

        if (webcamRef.current && webcamRef.current.video) {
          webcamRef.current.video.srcObject = stream;
          await new Promise<void>((resolve) => {
            if (webcamRef.current?.video) {
              webcamRef.current.video.onloadedmetadata = () => resolve();
            }
          });
        }

        objectDetectionModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2'
        });

        faceDetector = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
            modelType: 'short'
          }
        );
        
        setIsLoading(false);
        setIsDetecting(true);
        startDetection();
      } catch (error) {
        console.error('Error initializing models:', error);
        setHasError(true);
        setIsLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Camera Setup Failed',
          text: 'Please ensure camera permissions are granted and try again.',
          confirmButtonText: 'Retry',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }
    };

    const startDetection = () => {
      if (!webcamRef.current?.video || !objectDetectionModel || !faceDetector) return;
      
      const detectFrame = async () => {
        if (!isModelRunning || !webcamRef.current?.video || !canvasRef.current) {
          return;
        }
        
        const video = webcamRef.current.video;
        
        try {
          if (!video.readyState || video.readyState < 2) {
            animationFrameId = requestAnimationFrame(detectFrame);
            return;
          }

          const [objects, faces] = await Promise.all([
            objectDetectionModel.detect(video),
            faceDetector.estimateFaces(video, { flipHorizontal: false })
          ]);
          
          if (isModelRunning) {
            handleDetections(objects, faces);
            drawDetections(objects, faces);
            animationFrameId = requestAnimationFrame(detectFrame);
          }
        } catch (error) {
          console.error('Detection error:', error);
          if (isModelRunning) {
            animationFrameId = requestAnimationFrame(detectFrame);
          }
        }
      };
      
      detectFrame();
    };

    const handleDetections = (
      objects: cocoSsd.DetectedObject[],
      faces: faceDetection.Face[]
    ) => {
      if (!isDetecting) return;

      if (faces.length === 0) {
        incrementViolation('faceNotVisible');
        showAlert('Face Not Visible', 'Please stay within camera view');
      }
      
      if (faces.length > 1) {
        incrementViolation('multipleFaces');
        showAlert('Multiple Faces Detected', 'Only one person should be visible');
      }
      
      objects.forEach(obj => {
        if (!obj.class) return;
        
        if (obj.class === 'cell phone' || obj.class === 'mobile phone') {
          incrementViolation('mobileDetected');
          showAlert('Mobile Phone Detected', 'Mobile phones are not allowed during the test');
        }
        
        if (['book', 'laptop'].includes(obj.class)) {
          incrementViolation('prohibitedObjects');
          showAlert('Prohibited Object Detected', `${obj.class} is not allowed during the test`);
        }
      });
    };

    const drawDetections = (
      objects: cocoSsd.DetectedObject[],
      faces: faceDetection.Face[]
    ) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      faces.forEach(face => {
        if (!face.box) return;
        const box = face.box;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);
      });
      
      objects.forEach(obj => {
        if (!obj.bbox) return;
        const [x, y, width, height] = obj.bbox;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        if (obj.class) {
          ctx.fillStyle = '#ff0000';
          ctx.font = '16px Arial';
          ctx.fillText(obj.class, x, y > 10 ? y - 5 : 10);
        }
      });
    };

    const showAlert = (title: string, message: string) => {
      Swal.fire({
        icon: 'warning',
        title,
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    };

    initializeModels();

    return () => {
      isModelRunning = false;
      setIsDetecting(false);
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      if (webcamRef.current?.video?.srcObject) {
        const tracks = (webcamRef.current.video.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      if (objectDetectionModel) {
        objectDetectionModel.dispose();
      }
      if (faceDetector) {
        faceDetector.dispose();
      }

      tf.disposeVariables();
    };
  }, [incrementViolation, isDetecting]);

  if (isLoading) {
    return (
      <div className="relative bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[480px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Initializing camera and detection models...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="relative bg-red-50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[480px]">
        <Camera className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2">Camera access required</p>
        <p className="text-red-500 text-sm text-center">
          Please ensure camera permissions are granted and reload the page.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Webcam
        ref={webcamRef}
        className="rounded-lg"
        width={640}
        height={480}
        mirrored
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user",
          frameRate: 30
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        width={640}
        height={480}
      />
      <div className="absolute top-4 right-4 bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center gap-2">
        <AlertTriangle size={16} />
        <span className="text-sm font-medium">Monitoring Active</span>
      </div>
    </div>
  );
};

export default DetectionService;