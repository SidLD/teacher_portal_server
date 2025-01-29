
import { ref , uploadBytes , getDownloadURL, deleteObject} from "firebase/storage";
import { Storage } from "../config/firebase";
import File, { IFile } from "../models/fileMode";
import chalk from "chalk";

export const uploadImage = async (e: any, fileName: string): Promise<string | null> => {
    try {
        const img: any = e;
        const imageRef = ref(Storage, `teacher_portal/file/${fileName}_${new Date().getUTCDate()}`);
        const uploadResult = await uploadBytes(imageRef, img);
        console.log("Upload successful:", uploadResult);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        return null;
    }
};

/**
 * @param file 
 * @param fileName 
 * @param folder 
 * @returns 
 */
export const uploadFile = async (
  file: File, 
  fileName: string, 
): Promise< IFile | null> => {
  try {
    const fileExtension = file.name.split(".").pop();
    if (!fileExtension) throw new Error("Invalid file type");

    const fileRef = ref(Storage, `teacher_portal/file/${fileName}_${new Date().getTime()}.${fileExtension}`);

    const uploadResult = await uploadBytes(fileRef, file);
    console.log(chalk.green("Upload File successful"));

    const downloadURL = await getDownloadURL(uploadResult.ref);
    const fileId = await File.create({
        type: uploadResult.metadata.contentType,
        generation: uploadResult.metadata.generation,
        metageneration: uploadResult.metadata.metageneration,
        fullPath: uploadResult.metadata.fullPath,
        name: uploadResult.metadata.name,
        size: uploadResult.metadata.size,
        timeCreated: uploadResult.metadata.timeCreated,
        downloadURL
    })
    return fileId;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

export const deleteFile = async (filePath: string, fileId: string): Promise<string> => {
    try {
      const fileRef = ref(Storage, filePath);
  
      await deleteObject(fileRef);
      console.log(chalk.red("File deleted successfully from storage."));
  
      const deletedFile = await File.findByIdAndDelete(fileId);
      if (!deletedFile) {
        console.warn(chalk.yellow("File record not found in the database."));
        return "File deleted from storage, but no database record was found.";
      }
  
      return "File successfully deleted from storage and database.";
    } catch (error) {
      console.error("Error deleting file:", error);
      return "Error deleting file.";
    }
};