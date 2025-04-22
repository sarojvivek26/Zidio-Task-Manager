import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaDesktop, FaLink, FaCopy, FaPlay } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'sonner';
import MeetingNotification from './MeetingNotification';

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const peerConnection = useRef(null);
  const socket = useRef(null);
  const screenStream = useRef(null);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setPermissionsGranted(true);
      toast.success('Camera and microphone access granted');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Error accessing camera or microphone');
    }
  };

  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });
      
      setLocalStream(stream);
      
      // Ensure video element exists and is ready
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        
        // Wait for the video to be ready
        await new Promise((resolve) => {
          if (localVideoRef.current.readyState >= 3) { // HAVE_FUTURE_DATA
            resolve();
          } else {
            localVideoRef.current.onloadeddata = resolve;
          }
        });
        
        // Play the video
        await localVideoRef.current.play();
        
        // Set up event listeners for video state
        localVideoRef.current.onplaying = () => {
          console.log('Local video is playing');
        };
        
        localVideoRef.current.onerror = (error) => {
          console.error('Local video error:', error);
        };
      }
      
      setPermissionsGranted(true);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Error accessing camera or microphone');
      return null;
    }
  };

  const startMeeting = async () => {
    if (!permissionsGranted) {
      toast.error('Please grant camera and microphone permissions first');
      return;
    }

    try {
      // Initialize socket connection with improved configuration
      socket.current = io('http://localhost:3001', {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
        withCredentials: true,
        autoConnect: true
      });

      // Add connection event listeners
      socket.current.on('connect', () => {
        console.log('Connected to signaling server');
        toast.success('Connected to signaling server');
      });

      socket.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        toast.error('Failed to connect to signaling server. Please try again.');
      });

      socket.current.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error('Socket error occurred. Please try again.');
      });

      socket.current.on('disconnect', (reason) => {
        console.log('Disconnected from signaling server:', reason);
        if (reason === 'io server disconnect') {
          socket.current.connect();
        }
      });

      // Initialize peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      peerConnection.current = new RTCPeerConnection(configuration);

      // Add local stream to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream);
      });

      // Ensure local video is displayed in main window
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        await localVideoRef.current.play();
      }

      // Handle remote stream
      peerConnection.current.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(error => {
            console.error('Error playing remote video:', error);
          });
        }
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current.emit('ice-candidate', {
            candidate: event.candidate,
            to: meetingId
          });
        }
      };

      // Join the room
      socket.current.emit('join-room', meetingId);

      // Handle incoming offers
      socket.current.on('offer', async ({ offer, from }) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.current.emit('answer', {
          answer,
          to: from
        });
      });

      // Handle incoming answers
      socket.current.on('answer', async ({ answer }) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      });

      // Handle incoming ICE candidates
      socket.current.on('ice-candidate', async ({ candidate }) => {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      });

      // Handle user joined
      socket.current.on('user-joined', (userId) => {
        setParticipants(prev => [...prev, userId]);
        toast.success('New participant joined the meeting');
      });

      // Handle user left
      socket.current.on('user-left', (userId) => {
        setParticipants(prev => prev.filter(id => id !== userId));
        setRemoteStream(null); // Clear remote stream when user leaves
        toast.info('A participant left the meeting');
      });

      // Notify other users about the meeting
      socket.current.emit('meeting-started', meetingId);

      // Listen for meeting notifications
      socket.current.on('meeting-notification', (meetingId) => {
        if (window.location.pathname !== `/meetings/${meetingId}`) {
          setShowNotification(true);
        }
      });

      // Create and send offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.current.emit('offer', {
        offer,
        to: meetingId
      });

      setIsMeetingStarted(true);
      toast.success('Meeting started successfully');

    } catch (error) {
      console.error('Error starting meeting:', error);
      toast.error('Error starting the meeting');
    }
  };

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        // Initialize socket connection
        socket.current = io('http://localhost:3001');
        
        // Get local video stream
        const stream = await initializeLocalStream();
        if (!stream) return;

        // Initialize peer connection
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        };

        peerConnection.current = new RTCPeerConnection(configuration);

        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
          const remoteStream = event.streams[0];
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        };

        // Handle ICE candidates
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.current.emit('ice-candidate', {
              candidate: event.candidate,
              to: meetingId
            });
          }
        };

        // Join the room
        socket.current.emit('join-room', meetingId);

        // Handle incoming offers
        socket.current.on('offer', async ({ offer, from }) => {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.current.emit('answer', {
            answer,
            to: from
          });
        });

        // Handle incoming answers
        socket.current.on('answer', async ({ answer }) => {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        // Handle incoming ICE candidates
        socket.current.on('ice-candidate', async ({ candidate }) => {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        });

        // Handle user joined
        socket.current.on('user-joined', (userId) => {
          setParticipants(prev => [...prev, userId]);
          toast.success('New participant joined the meeting');
        });

        // Handle user left
        socket.current.on('user-left', (userId) => {
          setParticipants(prev => prev.filter(id => id !== userId));
          setRemoteStream(null); // Clear remote stream when user leaves
          toast.info('A participant left the meeting');
        });

        // Notify other users about the meeting
        socket.current.emit('meeting-started', meetingId);

        // Listen for meeting notifications
        socket.current.on('meeting-notification', (meetingId) => {
          if (window.location.pathname !== `/meetings/${meetingId}`) {
            setShowNotification(true);
          }
        });

        // Create and send offer
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.current.emit('offer', {
          offer,
          to: meetingId
        });

      } catch (error) {
        console.error('Error initializing meeting:', error);
        toast.error('Error initializing the meeting');
      }
    };

    initializeMeeting();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream.current) {
        screenStream.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [meetingId]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        screenStream.current = stream;
        
        // Replace video track in peer connection
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }

        // Handle when user stops sharing
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          // Restore camera track
          const cameraTrack = localStream.getVideoTracks()[0];
          const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(cameraTrack);
          }
        };

        setIsScreenSharing(true);
      } else {
        if (screenStream.current) {
          screenStream.current.getTracks().forEach(track => track.stop());
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast.error('Error sharing screen');
    }
  };

  const copyMeetingLink = () => {
    const meetingLink = `${window.location.origin}/meetings/${meetingId}`;
    navigator.clipboard.writeText(meetingLink);
    toast.success('Meeting link copied to clipboard');
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (socket.current) {
      socket.current.disconnect();
    }
    navigate('/dashboard');
  };

  if (!isMeetingStarted) {
    return (
      <div className="w-full h-screen bg-dark p-4 flex items-center justify-center">
        <div className="bg-dark-card p-6 rounded-lg max-w-md w-full text-center">
          <h2 className="text-white text-2xl font-bold mb-6">Start Meeting</h2>
          
          {/* Camera Preview */}
          {permissionsGranted && (
            <div className="mb-6 relative w-full aspect-video bg-dark-lighter rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            {!permissionsGranted ? (
              <button
                onClick={requestPermissions}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <FaVideo className="mr-2" />
                Grant Camera & Microphone Access
              </button>
            ) : (
              <button
                onClick={startMeeting}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <FaPlay />
                Start Meeting
              </button>
            )}
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-screen bg-dark p-4">
        <div className="flex flex-col h-full">
          {/* Meeting Info Bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <FaLink className="text-primary" />
              <span className="text-white">Meeting ID: {meetingId}</span>
              <button
                onClick={copyMeetingLink}
                className="ml-2 p-2 rounded-full bg-dark-card hover:bg-dark-lighter transition-colors"
                title="Copy meeting link"
              >
                <FaCopy className="text-white" />
              </button>
            </div>
            <div className="text-white">
              Participants: {participants.length + 1}
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-1 relative bg-dark-card rounded-lg overflow-hidden">
            {/* Local Video (Self View) */}
            <div className="absolute bottom-4 right-4 w-1/4 h-1/4 z-10 bg-dark-lighter rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{
                  transform: 'scaleX(-1)', // Mirror the video
                  backgroundColor: '#1a1a1a' // Dark background when video is loading
                }}
              />
            </div>
            
            {/* Main Video Display */}
            <div className="w-full h-full">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{
                    backgroundColor: '#1a1a1a' // Dark background when video is loading
                  }}
                />
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{
                    transform: 'scaleX(-1)', // Mirror the video
                    backgroundColor: '#1a1a1a' // Dark background when video is loading
                  }}
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 py-4">
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full ${isVideoEnabled ? 'bg-primary' : 'bg-red-500'} text-white hover:opacity-90 transition-opacity`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
            </button>
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full ${isAudioEnabled ? 'bg-primary' : 'bg-red-500'} text-white hover:opacity-90 transition-opacity`}
              title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isAudioEnabled ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
            </button>
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full ${isScreenSharing ? 'bg-red-500' : 'bg-primary'} text-white hover:opacity-90 transition-opacity`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <FaDesktop size={24} />
            </button>
            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-500 text-white hover:opacity-90 transition-opacity"
              title="End call"
            >
              <FaPhoneSlash size={24} />
            </button>
          </div>
        </div>
      </div>
      <Toaster richColors position="top-right" />
      {showNotification && (
        <MeetingNotification
          meetingId={meetingId}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

export default Meeting; 