import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Building, Briefcase, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.jpg';

const LoginModal = ({ userType, onClose }) => {
  const login = useStore((state) => state.login);

  const handleLogin = (e) => {
    e.preventDefault();
    login(userType);
  };

  const userTitles = {
    operator: 'Impact Partner',
    corporate: 'Corporate User',
    auditor: 'Auditor'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative transform transition-all duration-300 scale-95 hover:scale-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <div className="text-center mb-6">
          <img src={logo} alt="EcoChinh Logo" className="w-24 mx-auto mb-4"/>
          <h2 className="text-2xl font-bold text-charcoal">Log in as {userTitles[userType]}</h2>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-trusty-blue" id="email" type="email" placeholder="email@example.com" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-trusty-blue" id="password" type="password" placeholder="******************" />
          </div>
          <div className="flex items-center justify-center">
            <button className="bg-trusty-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors duration-300" type="submit">
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const LandingPage = () => {
  const [modalUserType, setModalUserType] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <img src={logo} alt="EcoChinh Logo" className="w-32 mx-auto mb-4"/>
          <h1 className="text-5xl font-bold text-charcoal tracking-tight">EcoChinh</h1>
          <p className="text-forest text-xl mt-2 mb-12">Create Impact and be a Part of It</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <LoginCard icon={<Building size={48} className="text-forest"/>} title="Impact Partner" description="Log in to verify waste processing and generate verifiable green assets." onClick={() => setModalUserType('operator')} />
            <LoginCard icon={<Briefcase size={48} className="text-forest"/>} title="Corporate User" description="Acquire green assets to meet your ESG goals and view your impact portfolio." onClick={() => setModalUserType('corporate')} />
            <LoginCard icon={<ShieldCheck size={48} className="text-forest"/>} title="Auditor" description="Access the immutable action ledger to perform independent verification." onClick={() => setModalUserType('auditor')} />
          </div>
        </div>
      </div>
      <footer className="w-full text-center py-4">
        <p className="text-gray-500 text-sm">Made in India for the World | आत्मनिर्भर भारत पर्यावरण में भी</p>
      </footer>
      {modalUserType && <LoginModal userType={modalUserType} onClose={() => setModalUserType(null)} />}
    </div>
  );
};

const LoginCard = ({ icon, title, description, onClick }) => (
  <button onClick={onClick} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col items-center text-center">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-charcoal mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </button>
);

export default LandingPage;