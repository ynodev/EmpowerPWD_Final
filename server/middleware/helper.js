

const getAuthHeader = () => {
   const token = localStorage.getItem('token');
   return { headers: { Authorization: `Bearer ${token}` } };
};
 

export default getAuthHeader;