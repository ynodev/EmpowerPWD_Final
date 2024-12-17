import { useNavigate } from 'react-router-dom';

const VideoCallLanding = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-center">Video Call</h1>
                
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate('/video/create')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                    >
                        Create New Meeting
                    </button>
                    
                    <button
                        onClick={() => navigate('/video/join')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                    >
                        Join Existing Meeting
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallLanding; 