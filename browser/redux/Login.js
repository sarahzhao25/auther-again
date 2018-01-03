import axios from 'axios';

export const CURRENT_USER = 'CURRENT_USER';
const DELETE_CURRENT_USER = 'DELETE_CURRENT_USER';

//thunk middleware
export function LogInUser(credentials, history, decision) {
  return function(dispatch) {
    let axiosPromise = () => {
      if (decision === 'login') return axios.post('/api/users/login', credentials)
      else return axios.post('/api/users/signup', credentials);
    };

    axiosPromise()
    .then(response => response.data)
    .then(user => {
      console.log(user)
      dispatch(setCurrentUser(user, decision));
      history.push(`/users/${user.id}`)
    })
    .catch(console.error);
  }
}

export function LogOut() {
  return (dispatch) => {
    axios.get('/api/users/logout')
    .then(() => dispatch(deleteCurrentUser()))
    .catch(console.error);
  }
}

// export function SignUpUser(credentials, history) {
//   return function(dispatch) {
//     axios.post('/api/users/signup', credentials)
//     .then(response => response.data)
//     .then(user => {
//       dispatch(setCurrentUser(user));
//       history.push(`/users/${user.id}`);
//     })
//     .catch(console.error);
//   }
// }

//action-creator
function setCurrentUser(user, decision) {
  return {
    type: CURRENT_USER,
    user,
    decision
  }
}

function deleteCurrentUser() {
  return {
    type: DELETE_CURRENT_USER
  }
}

//reducer
export function logIn(state = {}, action) {
  switch (action.type) {
    case CURRENT_USER:
      return action.user;
    case DELETE_CURRENT_USER:
      return {};
    default:
      return state;
  }
}
