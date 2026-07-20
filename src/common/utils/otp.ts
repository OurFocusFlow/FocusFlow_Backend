export const createOtp =  () : number=>{
    return Math.floor(Math.random() * (999999 - 10000 + 1 )+100000)
}