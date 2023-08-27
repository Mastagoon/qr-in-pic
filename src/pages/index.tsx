import { ChangeEvent, useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

const imageMimeType = /image\/(png|jpg|jpeg)/i;

export default function Home() {
  const [file, setFile] = useState<File>();
  const [fileDataURL, setFileDataURL] = useState<string>("");
  const [url, setUrl] = useState("")

  const handleSubmit = async () => {
    if (!url || !canvasRef.current || !file) return
    // make qr code based on url 
    // QRCode.toCanvas(canvasRef.current, url)
    const qr = await QRCode.toDataURL(url)
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx || !canvas) return
    const img = new Image()
    img.src = canvas.toDataURL()
    img.onload = () => {
      const qrImg = new Image()
      qrImg.src = qr
      qrImg.onload = () => {
        const { height: canvasHeight, width: canvasWidth } = canvas
        const { height: qrHeight, width: qrWidth } = qrImg
        console.log(canvasHeight, canvasWidth, qrHeight, qrWidth)
        // ctx?.drawImage(qrImg, Math.min(canvasWidth, 800), Math.min(canvasHeight, 800))
        ctx?.drawImage(qrImg, canvasWidth - qrHeight - 10, canvasHeight - qrWidth - 10)
        // ctx.translate(-50,)
      }
    }
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.match(imageMimeType)) {
      alert("Image mime type is not valid");
      return;
    }
    setFile(f)
  }

  useEffect(() => {
    let fileReader: FileReader, isCancel = false;
    if (file) {
      fileReader = new FileReader();
      fileReader.onload = (e) => {
        console.log("LOADED")
        const result = e.target?.result
        if (result && !isCancel) {
          setFileDataURL(result as string)
          const canvas = canvasRef.current
          const context = canvas?.getContext("2d")
          if (!context || !canvas) return
          const img = new Image()
          img.src = result as string
          img.onload = () => {
            // canvas.height = Math.min(img.height, 800)
            // canvas.width = Math.min(img.width, 800)
            canvas.height = img.height
            canvas.width = img.width
            context.drawImage(img, 0, 0)
          }
        }
      }
      console.log("LOading...")
      fileReader.readAsDataURL(file);
    }
    return () => {
      isCancel = true;
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort();
      }
    }

  }, [file]);

  return (
    <div className="flex flex-col min-h-screen container py-12">
      <div className="flex flex-row w-full justify-around">
        <div className="flex flex-col">
          <label className="text-4xl" htmlFor="img">Upload the image</label>
          <input onChange={handleUpload} type="file" />
          <img className="" src={fileDataURL} alt="" />
        </div>
        <div className="flex flex-col">
          <label className="text-4xl" htmlFor="img">Enter QR code URL</label>
          <div className="flex flex-row gap-2">
            <input className="text-black" value={url} onChange={(e) => setUrl(e.target.value)} type="text" />
            <button className="rounded-md px-4 py-1 border-2" disabled={typeof file === undefined} onClick={handleSubmit}>Submit</button>
          </div>
          <canvas
            className=""
            ref={canvasRef}
          ></canvas>
        </div>
      </div>
    </div>
  )
}
