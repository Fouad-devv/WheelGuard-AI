
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';


export const Public = () => {

  const { keycloak , initialized } = useKeycloak();
  const navigate = useNavigate();

  

  const handleLogin = () => {
    keycloak.login({ redirectUri: window.location.origin + '/home' }); // redirects to Keycloak login page
  };
    
  return (

    <div className='bg-gradient-to-r from-blue-300 to-red-200 h-screen'>

      <div>
        <h1 className='text-center h-20 text-2xl font-bold '>Hello every one</h1>
      </div>

      <div className='text-center'>
        <button 
          onClick={handleLogin}
          className='bg-red-500 rounded-lg px-5 py-1 border-gray-300 text-white shadow-sm hover:shadow-lg hover:bg-red-400'
        >
        sign up
        </button>
      </div>

    </div>
  );
}
    

