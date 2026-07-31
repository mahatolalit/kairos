import { useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";

export default function MessageInput() {
  const fileRef = useRef(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { sendMessage } = useChatStore();

  /* ---------- client‑side validation & preview ---------- */
  const onSelectFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("Only images allowed"); return;
    }
    if (f.size > 5 * 1024 * 1024) {       // 5 MB gate
      toast.error("Max 5 MB"); return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const resetImage = () => {
    setFile(null); setPreview(null);
    fileRef.current && (fileRef.current.value = "");
  };

  /* ------------- main send handler ------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;

    try {
      let imageUrl = null;

      if (file) {
        const sigRes = await axiosInstance.get("/cloudinary/sign");
        const {
          signature,
          timestamp,
          apiKey,
          cloudName,
          uploadPreset,
          folder,
        } = sigRes.data;

        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", apiKey);
        fd.append("timestamp", timestamp);
        fd.append("signature", signature);
        fd.append("folder", folder);
        fd.append("upload_preset", uploadPreset);

        const upRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: fd }
        );
        if (!upRes.ok) throw new Error("Upload failed");
        const upData = await upRes.json();
        imageUrl = upData.secure_url;
      }

      await sendMessage({ text: text.trim(), image: imageUrl });

      setText(""); resetImage();
    } catch (err) {
      console.error(err);
      toast.error("Send failed");
    }
  };

  return (
    <div className="p-4 w-full">
      {preview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img src={preview} alt="preview"
                 className="w-20 h-20 object-cover rounded-lg border border-base-300" />
            <button type="button" onClick={resetImage}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 grid place-content-center">
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
          />

          {/* hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={onSelectFile}
            className="hidden"
          />

          {/* open picker */}
          <button type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`btn btn-sm sm:btn-md btn-circle ${
                    preview ? "text-emerald-500" : "text-zinc-400"
                  }`}>
            <Image size={20}/>
          </button>
        </div>

        <button type="submit"
                disabled={!text.trim() && !file}
                className="btn btn-sm sm:btn-md btn-circle">
          <Send size={22}/>
        </button>
      </form>
    </div>
  );
}
