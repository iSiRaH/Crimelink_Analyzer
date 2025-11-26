function FacialRecognition() {
  return (
    <>
      <div className="flex flex-col gap-7 bg-slate-500 w-full h-full p-5">
        <p className="text-white font-semibold text-3xl mb-7">
          Facial Recognition: Suspect Identity
        </p>
        <div className="flex flex-row justify-around">
          <div className="flex flex-col items-center py-14 px-24 bg-slate-800 rounded-lg gap-4 border-white border-2">
            <p className="text-white font-medium">
              Drag & Drop Suspect Photo or Click to Upload(.JPEG, .PNG)
            </p>
            <button className="text-white font-medium bg-blue-500 py-2 px-6 rounded-md hover:bg-blue-600">
              Upload File
            </button>
          </div>
          <div className="flex flex-col items-center py-14 px-14 bg-slate-800 rounded-lg gap-4 border-white border-2">
            <p className="text-white font-medium">Uploaded Photo</p>
            <img src="" alt="Uploaded Suspect" />
          </div>
        </div>
        <button className="text-white font-medium bg-blue-500 py-2 px-6 rounded-md flex-none w-auto self-center hover:bg-blue-600">
          Analyze Photo
        </button>
      </div>
    </>
  );
}

export default FacialRecognition;
