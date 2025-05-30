import {BASE_URL_SERVER} from "../config/server";
import axios from "axios";

const API_ENDPOINT = {
    SHOW_LIST_POST: "/api/post/favorites/list",
    ADD_UPDATE_FAVOURITE: "/api/post/favorites/store",
}

class FavouriteService {
    showListPost = (id) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.get(BASE_URL_SERVER + API_ENDPOINT.SHOW_LIST_POST + '?user_id=' + id, config);
    }

    addUpdateFavourite = (data) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.post(BASE_URL_SERVER + API_ENDPOINT.ADD_UPDATE_FAVOURITE, data, config);
    }
}

const favouriteService = new FavouriteService();
export default favouriteService;