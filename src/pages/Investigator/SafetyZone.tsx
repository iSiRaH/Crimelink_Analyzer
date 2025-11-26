function SafetyZone() {
  return (
    <>
      <div className="bg-slate-500 w-full h-full p-5">
        <p className="font-semibold text-3xl text-white mb-5">Safety Zone</p>
        <div className="flex flex-row w-full justify-evenly">
          <div className="flex flex-col aspect-auto w-1/5 gap-4 items-center">
            <div>
              <input type="text" className="h-8 rounded-lg w-full" />
            </div>
            <div>
              <button className="bg-slate-800 text-white hover:bg-slate-600 hover:text-black px-7 py-2 rounded-xl">Search</button>
            </div>
            <div>safety types</div>
          </div>
          <div className="aspect-square w-3/5">map</div>
        </div>
      </div>
    </>
  );
}

export default SafetyZone;
