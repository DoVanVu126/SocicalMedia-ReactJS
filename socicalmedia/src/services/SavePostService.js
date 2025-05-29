import {BASE_URL_SERVER} from "../config/server";
import axios from "axios";

const API_ENDPOINT = {
    SHOW_LIST_POST: "/api/post/saves/list",
    ADD_UPDATE_SAVE: "/api/post/saves/store",
}

class SavePostService {
    showListPost = (id) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.get(BASE_URL_SERVER + API_ENDPOINT.SHOW_LIST_POST + '?user_id=' + id, config);
    }

    addUpdateSave = (data) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.post(BASE_URL_SERVER + API_ENDPOINT.ADD_UPDATE_SAVE, data, config);
    }
}

const savePostService = new SavePostService();
export default savePostService;