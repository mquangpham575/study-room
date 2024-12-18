import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const storage = getStorage();

export const uploadChatImage = async (chatId, file) => {
  console.log(chatId, file.name);
  const date = new Date();
  const rref = ref(storage, 'chatimgs');
  const cref = ref(rref, chatId);
  const storageRef = ref(cref, date + file.name);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject)=>{
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      }, 
      (error) => {
        reject("Something went wrong! " + error.code)
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  })
}