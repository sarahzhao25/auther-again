import { combineReducers } from 'redux';
import users from './users';
import stories from './stories';
import {logIn as currentUser} from './Login';

export default combineReducers({ users, stories, currentUser });
