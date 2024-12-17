import React, { useState } from 'react';
import { Info, forest, Award, Globe, Bird, Sun } from 'lucide-react';

// Quiz Questions
const QUIZ_QUESTIONS = [
  {
    question: "How many tonnes of CO₂ do forests absorb annually?",
    options: ["1.2 billion", "2.6 billion", "3.8 billion", "0.5 billion"],
    correctAnswer: "2.6 billion"
  },
  {
    question: "Approximately how many species are at risk of extinction?",
    options: ["100,000", "500,000", "1 million", "250,000"],
    correctAnswer: "1 million"
  },
  {
    question: "What does SDG 15 primarily focus on?",
    options: [
      "Ocean conservation", 
      "Urban development", 
      "Protecting land ecosystems", 
      "Agricultural productivity"
    ],
    correctAnswer: "Protecting land ecosystems"
  }
];

const SuccessStories = [
  {
    title: "Amazon Reforestation",
    description: "Restoring critical rainforest ecosystems in Brazil",
    icon: <forest className="text-green-600" size={48} />
  },
  {
    title: "Wildlife Corridors in Kenya",
    description: "Creating safe migration routes for endangered species",
    icon: <Bird className="text-blue-600" size={48} />
  },
  {
    title: "Urban Forestry in Singapore",
    description: "Integrating green spaces into urban landscapes",
    icon: <Sun className="text-yellow-600" size={48} />
  }
];

const SDG15Website = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleQuizStart = () => {
    setQuizStarted(true);
  };

  const handleAnswer = (selectedAnswer) => {
    if (selectedAnswer === QUIZ_QUESTIONS[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const renderQuizContent = () => {
    if (quizCompleted) {
      return (
        <div className="text-center p-8 bg-green-50">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl">
            Your Score: {score} out of {QUIZ_QUESTIONS.length}
          </p>
          <button 
            onClick={() => {
              setQuizStarted(false);
              setCurrentQuestion(0);
              setScore(0);
              setQuizCompleted(false);
            }}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Restart Quiz
          </button>
        </div>
      );
    }

    if (quizStarted) {
      const currentQuizQuestion = QUIZ_QUESTIONS[currentQuestion];
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">
            Question {currentQuestion + 1}
          </h2>
          <p className="mb-6 text-xl">{currentQuizQuestion.question}</p>
          <div className="grid grid-cols-2 gap-4">
            {currentQuizQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center p-8">
        <button 
          onClick={handleQuizStart}
          className="px-8 py-3 bg-green-600 text-white text-xl rounded-lg hover:bg-green-700"
        >
          Start Quiz
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white text-gray-900">
      {/* Hero Banner */}
      <section 
        className="relative h-screen bg-cover bg-center flex items-center justify-center text-white"
        style={{
          backgroundImage: "url('/api/placeholder/1920/1080')",
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
      >
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Protect Life on Land – SDG 15</h1>
          <p className="text-2xl mb-8">Safeguarding ecosystems, combating deforestation, and halting biodiversity loss</p>
          <a href="#about" className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700">
            Learn More
          </a>
        </div>
      </section>

      {/* About SDG 15 */}
      <section id="about" className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What is SDG 15?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <forest size={64} className="mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2">Combat Deforestation</h3>
            <p>Protect and restore forest ecosystems worldwide</p>
          </div>
          <div className="text-center">
            <Globe size={64} className="mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2">Preserve Biodiversity</h3>
            <p>Protect endangered species and their habitats</p>
          </div>
          <div className="text-center">
            <Sun size={64} className="mx-auto mb-4 text-yellow-600" />
            <h3 className="text-xl font-semibold mb-2">Sustainable Land Use</h3>
            <p>Promote responsible land management practices</p>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {SuccessStories.map((story, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                {story.icon}
                <h3 className="text-xl font-semibold mt-4">{story.title}</h3>
                <p className="mt-2">{story.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Quiz */}
      <section className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center pt-8 mb-4">
            Test Your Knowledge About SDG 15
          </h2>
          <p className="text-center mb-8">
            How much do you know about protecting life on land?
          </p>
          {renderQuizContent()}
        </div>
      </section>
    </div>
  );
};

export default SDG15Website;