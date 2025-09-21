import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import logo from '../assets/logo.jpg';
import { Check, DollarSign, Package, X, Zap, PlusCircle } from 'lucide-react';

// AI Imports
import * as tf from "@tensorflow/tfjs";
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";

const BATCH_ITEM_TYPE = 'bottle';
const BATCH_ITEM_RATE = 5; // Rs. 5 per bottle
const BATCH_ITEM_WEIGHT_KG = 0.020; // 20 grams per bottle
const DETECTION_CONFIDENCE_THRESHOLD = 0.70; // Only consider detections with > 70% confidence

// --- Main Component ---
const OperatorDashboard = () => {
  const { operatorStats, mintToken, logout } = useStore((state) => ({
    operatorStats: state.operatorStats,
    mintToken: state.mintToken,
    logout: state.logout,
  }));

  const [isScanning, setIsScanning] = useState(false);

  if (isScanning) {
    return <BatchCreationView onFinishScan={() => setIsScanning(false)} mintToken={mintToken} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={logout} />
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<Zap className="text-yellow-500" />} title="Impact Generated" value={operatorStats.impactGenerated} unit="Tokens" />
          <StatCard icon={<Package className="text-green-500" />} title="Impact Distributed" value={operatorStats.impactDistributed} unit="Tokens" />
          <StatCard icon={<DollarSign className="text-blue-500" />} title="Value Obtained" value={`₹${operatorStats.valueObtained.toLocaleString('en-IN')}`} />
        </div>
        <div className="text-center">
          <button
            onClick={() => setIsScanning(true)}
            className="bg-trusty-blue hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            + Create New Batch
          </button>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---

const Header = ({ onLogout }) => (
  <header className="bg-white shadow-md p-4 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <img src={logo} alt="EcoChinh Logo" className="h-10" />
      <h1 className="text-2xl font-bold text-charcoal">Impact Generation Hub</h1>
    </div>
    <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
      Logout
    </button>
  </header>
);

const StatCard = ({ icon, title, value, unit }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-charcoal">{value} <span className="text-lg font-medium text-gray-600">{unit}</span></p>
    </div>
  </div>
);

// The AI-powered scanning view
const BatchCreationView = ({ onFinishScan, mintToken }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing AI Engine...');
  
  const [stagedDetection, setStagedDetection] = useState(null); // Holds the currently detected item
  const [detectedCount, setDetectedCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- AI Logic ---

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.setBackend('webgl');
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setLoadingMessage('');
      } catch (error) {
        console.error("Error loading AI model:", error);
        setLoadingMessage('AI Engine Failed to Start. Please refresh.');
      }
    };
    loadModel();
  }, []);

  const runCoco = async () => {
    if (model && webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      
      const predictions = await model.detect(video);
      
      const highConfidenceBottle = predictions.find(
        p => p.class === BATCH_ITEM_TYPE && p.score > DETECTION_CONFIDENCE_THRESHOLD
      );
      
      setStagedDetection(highConfidenceBottle || null);
      
      const ctx = canvasRef.current.getContext("2d");
      drawRect(predictions, ctx, video.videoWidth, video.videoHeight);

      requestAnimationFrame(runCoco);
    } else {
        setTimeout(runCoco, 100);
    }
  };

  useEffect(() => {
    if (model) {
      runCoco();
    }
  }, [model]);


  const drawRect = (detections, ctx, videoWidth, videoHeight) => {
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    detections.forEach(prediction => {
      if (prediction.score > 0.60) { // Only draw confident predictions
        const [x, y, width, height] = prediction.bbox;
        const text = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
        ctx.strokeStyle = '#0057FF';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#0057FF';
        ctx.font = '16px Inter';
        ctx.beginPath();
        ctx.fillText(text, x, y > 10 ? y - 5 : 10);
        ctx.rect(x, y, width, height);
        ctx.stroke();
      }
    });
  }

  // --- UI Handler ---

  const handleAddItem = () => {
    if (stagedDetection) {
      setDetectedCount(prevCount => prevCount + 1);
    }
  };

  const handleFinish = () => setShowConfirmModal(true);
  
  const handleConfirm = (manualWeight) => {
    const newBatchId = `EC-BATCH-${Date.now()}`;
    const tokenPrice = detectedCount * BATCH_ITEM_RATE;

    const newToken = {
      id: `EC-TOKEN-${Date.now()}`,
      batchId: newBatchId, status: 'Available', owner: null, material: 'PET Plastic',
      itemCount: detectedCount, estimatedWeight: detectedCount * BATCH_ITEM_WEIGHT_KG,
      finalWeight: manualWeight, price: tokenPrice, source: 'Manipal Recycling Unit (Demo)',
      vintage: new Date().toLocaleDateString('en-IN'), proofPhotoCID: `bafy_mock_photo_${newBatchId}`,
      transactionReceiptCID: null, certificateCID: null,
    };
    
    mintToken(newToken);
    setShowConfirmModal(false);
    onFinishScan();
  };

  const estimatedWeight = (detectedCount * BATCH_ITEM_WEIGHT_KG).toFixed(2);

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col">
      <div className="p-4 bg-gray-800 flex justify-between items-center shadow-lg">
        <h2 className="text-xl font-bold">Batch Creation: Live Scanning</h2>
        <button 
          onClick={handleFinish} 
          disabled={detectedCount === 0}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <Check /> Finish & Verify
        </button>
      </div>

      <div className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        <div className="flex-grow relative">
          {loadingMessage && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10"><p className="text-2xl">{loadingMessage}</p></div>}
          <Webcam
            ref={webcamRef}
            muted={true}
            className="w-full h-full object-cover rounded-lg"
            videoConstraints={{ facingMode: "environment" }}
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0"/>
        </div>

        <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400">Items in Batch</p>
                <p className="text-5xl font-bold">{detectedCount}</p>
            </div>
             <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400">Estimated Weight</p>
                <p className="text-3xl font-bold">{estimatedWeight} <span className="text-xl">kg</span></p>
            </div>
             <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400">Estimated Value</p>
                <p className="text-3xl font-bold">₹{(detectedCount * BATCH_ITEM_RATE).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 flex-grow flex flex-col items-center justify-center">
                <p className="text-gray-400 mb-2">Detected Item</p>
                {stagedDetection ? (
                    <div className="text-center">
                        <p className="text-xl font-bold text-green-400 capitalize">{stagedDetection.class}</p>
                        <p className="text-sm text-gray-300">Confidence: {Math.round(stagedDetection.score * 100)}%</p>
                        <button onClick={handleAddItem} className="mt-4 bg-trusty-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 text-lg">
                            <PlusCircle /> Add to Batch
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-500">Point camera at an item...</p>
                )}
            </div>
        </div>
      </div>
       {showConfirmModal && <ConfirmModal onConfirm={handleConfirm} onCancel={() => setShowConfirmModal(false)} />}
    </div>
  );
};

// Confirmation Modal (No changes)
const ConfirmModal = ({ onConfirm, onCancel }) => {
  const [manualWeight, setManualWeight] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onConfirm(parseFloat(manualWeight) || 0); };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg text-charcoal">
        <h2 className="text-2xl font-bold mb-4">Verify & Generate Proof</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="manualWeight">Final Certified Weight (kg)</label>
            <input id="manualWeight" type="number" step="0.01" value={manualWeight} onChange={(e) => setManualWeight(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-trusty-blue" 
              placeholder="e.g., 5.25" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="proofPhoto">Upload Proof Photo (to IPFS)</label>
            <input id="proofPhoto" type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-trusty-blue hover:file:bg-blue-100" />
            <p className="text-xs text-gray-500 mt-1">This is for demonstration. The file won't be uploaded in this prototype.</p>
          </div>
          <div className="flex items-center justify-end gap-4">
             <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-charcoal font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-trusty-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Confirm & Generate Proof</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperatorDashboard;