export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img
              src="/icon/logo.webp"
              alt="Logo trường THCS Hải Giang"
              className="h-10 rounded-md object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-red-600">
                Trường THCS Hải Giang
              </h3>
            </div>
          </div>
          <p className="text-sm">
            <b>Địa chỉ:</b> Xã Hải Giang, Huyện Hải Hậu, Tỉnh Nam Định
          </p>
          <p className="text-sm">
            <b>Điện thoại:</b> 0123 456 789
          </p>
          <p className="text-sm">
            <b>Email:</b> thcshaigiang@edu.namdinh.gov.vn
          </p>
          <p className="text-sm">
            <b> &copy; {new Date().getFullYear()} Trường THCS Hải Giang</b>
          </p>
        </div>
      </div>
    </footer>
  );
}
