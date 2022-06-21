import axios from 'axios';
import {
  createAsyncThunk,
} from '@reduxjs/toolkit';

const routes = {
  dataPath: () => '/api/v1/data',
};

export default createAsyncThunk(
  'chat/data',
  async () => {
    const userId = JSON.parse(localStorage.getItem('userId'));
    const response = await axios.get(routes.dataPath(), {
      headers: {
        Authorization: `Bearer ${userId.token}`,
      },
    });
    return response.data;
  },
);
