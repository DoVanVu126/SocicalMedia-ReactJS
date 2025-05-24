import {BASE_URL_SERVER} from "../config/server";
import axios from "axios";

const API_ENDPOINT = {
    SHOW_LIST_FRIEND: "/api/friends/list",
    SHOW_LIST_FRIEND_REQUEST: "/api/friends/request",
    SHOW_LIST_FRIEND_PENDING: "/api/friends/pending",
    SHOW_LIST_NO_FRIEND: "/api/friends/no-friends",
    INIT_FRIEND_REQUEST: "/api/friends/store",
    ACCEPT_FRIEND: "/api/friends/accept",
    REJECT_FRIEND: "/api/friends/reject",
}

class FriendService {
    showListFriend = (id) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.get(BASE_URL_SERVER + API_ENDPOINT.SHOW_LIST_FRIEND + '?user_id=' + id, config);
    }

    showListFriendRequest = (id) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.get(BASE_URL_SERVER + API_ENDPOINT.SHOW_LIST_FRIEND_REQUEST + '?user_id=' + id, config);
    }

    showListFriendPending = (id) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.get(BASE_URL_SERVER + API_ENDPOINT.SHOW_LIST_FRIEND_PENDING + '?user_id=' + id, config);
    }

    showListNoFriend = (id) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.get(BASE_URL_SERVER + API_ENDPOINT.SHOW_LIST_NO_FRIEND + '?user_id=' + id, config);
    }

    initFriendRequest = (data) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.post(BASE_URL_SERVER + API_ENDPOINT.INIT_FRIEND_REQUEST, data, config);
    }

    acceptFriend = (data) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.post(BASE_URL_SERVER + API_ENDPOINT.ACCEPT_FRIEND, data, config);
    }

    rejectFriend = (data) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.post(BASE_URL_SERVER + API_ENDPOINT.REJECT_FRIEND, data, config);
    }
}

const friendService = new FriendService();
export default friendService;