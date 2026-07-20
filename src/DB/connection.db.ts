import { connect } from "mongoose"
import { DB_URI } from "../config/config"



const connectdb = async () => {
    try {
        await connect(DB_URI)
        console.log('db connected successfully 😜 ');
        
    } catch (error) {
        console.log(`fail to connect db ${error}`);
        
    }
}

export default connectdb