import multer from "multer";
import { nanoid } from "nanoid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./tmpUploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + nanoid(7) + `.${file.mimetype.split("/")[1]}`
    );
  },
});

const upload = multer({ storage: storage });

export default upload;
