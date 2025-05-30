import {BASE_URL_SERVER} from "../config/server";
import axios from "axios";

const API_ENDPOINT = {
   SHARE_POST: "/api/post/share",
}

class PostService {
    sharePost = (data) => {
        const config = {
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
            }
        };
        return axios.post(BASE_URL_SERVER + API_ENDPOINT.SHARE_POST, data, config);
    }
}

const postService = new PostService();
export default postService;