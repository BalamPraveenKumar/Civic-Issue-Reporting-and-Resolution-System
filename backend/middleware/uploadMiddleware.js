import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        if (file.mimetype.startsWith("image")) {
            cb(null, "uploads/images");
        } else {
            cb(null, "uploads/videos");
        }

    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );
    }
});

const upload = multer({ storage });

export default upload;