import {DUMMY_OTP} from '../constants';
import {products,locations} from '../data';
export const sendOtp=async mobile=>({success:true,mobile});
export const verifyOtp=async(mobile,otp)=>{if(otp!==DUMMY_OTP)throw new Error('Invalid OTP. Demo OTP is 123456.');return{user:{id:'1',name:'ANIL',mobile},token:'dummy-token'};};
export const getProducts=async()=>products;
export const getProduct=async id=>products.find(x=>x.id===String(id));
export const getLocation=async id=>locations.find(x=>x.id===id)||locations[2];
