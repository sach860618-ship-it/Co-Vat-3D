import * as THREE from 'three';
import DestinationStatus from "./DestinationStatus";

export type ArtifactModel = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  thumbnail: string;
  modelUrl: string;
  audioUrl?: string;
  scale: THREE.Vector3;
  rotation: THREE.Vector3;
  position: THREE.Vector3;
  color: number;
};

export type LightPreset = 'museum' | 'daylight' | 'sunset' | 'neon';

export type EnvironmentModel = {
  id: string;
  name: string;
  modelUrl: string;
  scale: THREE.Vector3;
  rotation: THREE.Vector3;
  position: THREE.Vector3;
  defaultLightPreset: LightPreset;
  defaultLightIntensity: number;
};

export type CulturalDestinationModel = {
  id: string;
  name: string;
  thumbnail: string;
  status: string;
  tourUrl: string;
  description: string;
  audioUrl?: string;
  environment: EnvironmentModel;
  modelUrl: string;
  scale: THREE.Vector3;
  rotation: THREE.Vector3;
  position: THREE.Vector3;
  artifacts: ArtifactModel[];
};

// ==========================================
// 1. PHÒNG TRƯNG BÀY CỔ VẬT
// ==========================================
export const tachTraNhatBanArtifact: ArtifactModel = {
  id: "tach-tra-nhat-ban",
  name: "Tách trà cổ Nhật Bản",
  tagline: "Tinh hoa văn hóa trà đạo",
  description: "Tách trà gốm cổ được chế tác xảo quyệt với họa tiết truyền thống, thể hiện tinh thần Wabi-sabi của nghệ thuật trà đạo.",
  thumbnail: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/japanese_tea_cup.glb",
  audioUrl: "/audio/tach-tra-nhat-ban.mp3",
  scale: new THREE.Vector3(5, 5, 5),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(0, 0, -4),
  color: 0xd97706,
};

export const tachCaPheHoangGiaArtifact: ArtifactModel = {
  id: "tach-ca-phe-hoang-gia",
  name: "Tách cà phê hoàng gia",
  tagline: "Dấu ấn phong cách quý tộc",
  description: "Cổ vật tách cà phê phong cách cổ điển với những đường nét hoa văn chạm khắc tinh tế sang trọng.",
  thumbnail: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/coffee_cup.glb",
  audioUrl: "/audio/tach-ca-phe-hoang-gia.mp3",
  scale: new THREE.Vector3(20, 20, 20),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(-6, 1, -4),
  color: 0x059669,
};

export const giaDoLyCoArtifact: ArtifactModel = {
  id: "gia-do-ly-co",
  name: "Giá đỡ ly chạm khắc",
  tagline: "Vật phẩm thủ công mỹ nghệ",
  description: "Được đúc bằng hợp kim đồng mạ vàng với các chi tiết uốn lượn mang đậm nét kiến trúc cổ điển.",
  thumbnail: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/cup_holder.glb",
  audioUrl: "/audio/gia-do-ly-co.mp3",
  scale: new THREE.Vector3(1, 1, 1),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(6, 0, -4),
  color: 0x2563eb,
};

export const tachCappuccinoCoArtifact: ArtifactModel = {
  id: "tach-cappuccino-co",
  name: "Tách Cappuccino cổ điển",
  tagline: "Giao thoa văn hóa Đông Tây",
  description: "Mẫu tách gốm tráng men dành riêng cho các buổi thưởng trà và cà phê trong cung điện xưa.",
  thumbnail: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/cup_of_cappuccino.glb",
  audioUrl: "/audio/tach-cappuccino-co.mp3",
  scale: new THREE.Vector3(20, 20, 20),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(-5, 0, 3),
  color: 0x9333ea,
};

export const lySodaHuyenBiArtifact: ArtifactModel = {
  id: "ly-soda-huyen-bi",
  name: "Ly soda cổ tích",
  tagline: "Bảo vật huyền bí",
  description: "Vật phẩm lưu niệm cổ mang màu sắc huyền bí và phong cách thiết kế độc đáo từ thế kỷ trước.",
  thumbnail: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/fnaf_soda_cup.glb",
  audioUrl: "/audio/ly-soda-huyen-bi.mp3",
  scale: new THREE.Vector3(3, 3, 3),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(5, 0, 3),
  color: 0xec4899,
};

// ==========================================
// MÔ HÌNH KHÔNG GIAN MÔI TRƯỜNG 3D (ENVIRONMENTS)
// ==========================================
export const thePictureGalleryEnvironment: EnvironmentModel = {
  id: "the-picture-gallery",
  name: "Phòng trưng bày tranh cổ điển",
  modelUrl: "/models/Environment/the_picture_gallery.glb",
  defaultLightPreset: "daylight",
  defaultLightIntensity: 1.2,
  scale: new THREE.Vector3(100.0, 100.0, 100.0),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(0, -1.55, 0),
};

export const exhibitionRoomEnvironment: EnvironmentModel = {
  id: "wip-exhibition-room",
  name: "Phòng triển lãm hiện đại",
  modelUrl: "/models/Environment/wip_-_exhibition_room.glb",
  defaultLightPreset: "daylight",
  defaultLightIntensity: 1.2,
  scale: new THREE.Vector3(0.04, 0.04, 0.04),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(0, 0, 0),
};

export const richardsGalleryEnvironment: EnvironmentModel = {
  id: "richards-art-gallery",
  name: "Phòng trưng bày nghệ thuật vòm Richards",
  modelUrl: "/models/Environment/richards_art_gallery_-_audio_tour.glb",
  defaultLightPreset: "daylight",
  defaultLightIntensity: 1.2,
  scale: new THREE.Vector3(2.5, 2.5, 2.5),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(-4.5, 0, 0),
};

export const hueImperialEnvironment: EnvironmentModel = {
  id: "hue-imperial-chamber",
  name: "Không gian trưng bày Cố đô Huế",
  modelUrl: "/models/Environment/the_picture_gallery.glb",
  defaultLightPreset: "daylight",
  defaultLightIntensity: 1.2,
  scale: new THREE.Vector3(100.0, 100.0, 100.0),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(0, -1.55, 0),
};

export const phongTrungBayCoVatDestination: CulturalDestinationModel = {
  id: "phong-trung-bay-co-vat",
  name: "Phòng trưng bày cổ vật",
  thumbnail: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=600&auto=format&fit=crop",
  status: DestinationStatus.AVAILABLE,
  tourUrl: "/heritage-tour/phong-trung-bay-co-vat",
  description: "Không gian trưng bày các cổ vật 3D tương tác.",
  audioUrl: "/audio/phong-trung-bay-co-vat.mp3",
  environment: thePictureGalleryEnvironment,
  modelUrl: thePictureGalleryEnvironment.modelUrl,
  scale: thePictureGalleryEnvironment.scale,
  rotation: thePictureGalleryEnvironment.rotation,
  position: thePictureGalleryEnvironment.position,
  artifacts: [
    tachTraNhatBanArtifact,
    tachCaPheHoangGiaArtifact,
    giaDoLyCoArtifact,
    tachCappuccinoCoArtifact,
    lySodaHuyenBiArtifact,
  ],
};

// ==========================================
// 2. DI TÍCH THÀNH NHÀ HỒ
// ==========================================
export const tachTraThanhNhaHoArtifact: ArtifactModel = {
  id: "tach-tra-thanh-nha-ho",
  name: "Tách gốm cổ Thành Nhà Hồ",
  tagline: "Vật dụng sinh hoạt thời Hồ",
  description: "Tách gốm đất nung được phát hiện tại di tích Thành Nhà Hồ, minh chứng cho kỹ thuật gốm sứ thời Trần - Hồ.",
  thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/coffee_shop_cup.glb",
  audioUrl: "/audio/tach-tra-thanh-nha-ho.mp3",
  scale: new THREE.Vector3(2, 2, 2),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(0, 0, -4),
  color: 0xb45309,
};

export const deChenDongCoArtifact: ArtifactModel = {
  id: "de-chen-dong-co",
  name: "Đế chén đồng cổ",
  tagline: "Hoa văn đá & kim loại",
  description: "Vật phẩm chứa chén bằng đồng với họa tiết vân mây đặc trưng của kiến trúc đá Thành Nhà Hồ.",
  thumbnail: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/cup_holder.glb",
  audioUrl: "/audio/de-chen-dong-co.mp3",
  scale: new THREE.Vector3(0.8, 0.8, 0.8),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(5, 0, -2),
  color: 0xd97706,
};

export const thanhNhaHoDestination: CulturalDestinationModel = {
  id: "thanh-nha-ho",
  name: "Di tích Thành Nhà Hồ",
  thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?q=80&w=600&auto=format&fit=crop",
  status: DestinationStatus.AVAILABLE,
  tourUrl: "/heritage-tour/thanh-nha-ho",
  description: "Di sản văn hóa thế giới kiến trúc đá độc đáo.",
  audioUrl: "/audio/thanh-nha-ho.mp3",
  environment: exhibitionRoomEnvironment,
  modelUrl: exhibitionRoomEnvironment.modelUrl,
  scale: exhibitionRoomEnvironment.scale,
  rotation: exhibitionRoomEnvironment.rotation,
  position: exhibitionRoomEnvironment.position,
  artifacts: [
    tachTraThanhNhaHoArtifact,
    deChenDongCoArtifact,
  ],
};

// ==========================================
// 3. ĐỀN THỜ BÀ TRIỆU
// ==========================================
export const chenTraTeLeArtifact: ArtifactModel = {
  id: "chen-tra-te-le",
  name: "Chén trà tế lễ cổ",
  tagline: "Vật phẩm tâm linh linh thiêng",
  description: "Chén trà dùng trong các nghi lễ cúng tế tại Đền thờ Bà Triệu, lưu giữ nét đẹp văn hóa tâm linh lâu đời.",
  thumbnail: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/japanese_tea_cup.glb",
  audioUrl: "/audio/chen-tra-te-le.mp3",
  scale: new THREE.Vector3(1.4, 1.4, 1.4),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(-4, 0, -3),
  color: 0x047857,
};

export const binhGomDenBaTrieuArtifact: ArtifactModel = {
  id: "binh-gom-den-ba-trieu",
  name: "Tách cúng tráng men",
  tagline: "Nghệ thuật đúc & nung cổ",
  description: "Tách cúng tráng men xanh ngọc quý giá, tượng trưng cho sự uy nghiêm và lòng tôn kính.",
  thumbnail: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/cup_of_cappuccino.glb",
  audioUrl: "/audio/binh-gom-den-ba-trieu.mp3",
  scale: new THREE.Vector3(1.2, 1.2, 1.2),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(4, 0, -3),
  color: 0x059669,
};

export const denThoBaTrieuDestination: CulturalDestinationModel = {
  id: "den-tho-ba-trieu",
  name: "Đền thờ Bà Triệu",
  thumbnail: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?q=80&w=600&auto=format&fit=crop",
  status: DestinationStatus.AVAILABLE,
  tourUrl: "/heritage-tour/den-tho-ba-trieu",
  description: "Di tích lịch sử kiến trúc nghệ thuật quốc gia.",
  audioUrl: "/audio/den-tho-ba-trieu.mp3",
  environment: richardsGalleryEnvironment,
  modelUrl: richardsGalleryEnvironment.modelUrl,
  scale: richardsGalleryEnvironment.scale,
  rotation: richardsGalleryEnvironment.rotation,
  position: richardsGalleryEnvironment.position,
  artifacts: [
    chenTraTeLeArtifact,
    binhGomDenBaTrieuArtifact,
  ],
};

// ==========================================
// 4. KINH THÀNH HUẾ
// ==========================================
export const chenGomMeoThuanArtifact: ArtifactModel = {
  id: "chen-gom-meo-thuan",
  name: "Chén gốm Mèo Thuẫn Cung Đình",
  tagline: "Bảo vật quý triều Nguyễn",
  description: "Chén gốm vẽ hình mèo phong thủy độc đáo, từng được sử dụng trong nội cung triều Nguyễn.",
  thumbnail: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/kawaii_skeleton_cat_cup.glb",
  audioUrl: "/audio/chen-gom-meo-thuan.mp3",
  scale: new THREE.Vector3(1.3, 1.3, 1.3),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(0, 0, -4),
  color: 0x7c3aed,
};

export const tachTraCungDinhHueArtifact: ArtifactModel = {
  id: "tach-tra-cung-dinh-hue",
  name: "Tách trà Cung đình Huế",
  tagline: "Tinh hoa ẩm thực triều đình",
  description: "Tách trà sứ vẽ rồng phượng mạ vàng quý hiếm dùng cho các buổi yến tiệc hoàng gia.",
  thumbnail: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
  modelUrl: "/models/Cup/coffee_cup.glb",
  audioUrl: "/audio/tach-tra-cung-dinh-hue.mp3",
  scale: new THREE.Vector3(1.2, 1.2, 1.2),
  rotation: new THREE.Vector3(0, 0, 0),
  position: new THREE.Vector3(-5, 0, -2),
  color: 0xd97706,
};

export const kinhThanhHueDestination: CulturalDestinationModel = {
  id: "kinh-thanh-hue",
  name: "Kinh thành Huế",
  thumbnail: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=600&auto=format&fit=crop",
  status: DestinationStatus.COMING_SOON,
  tourUrl: "/heritage-tour/kinh-thanh-hue",
  description: "Quần thể di tích Cố đô Huế cổ kính.",
  audioUrl: "/audio/kinh-thanh-hue.mp3",
  environment: hueImperialEnvironment,
  modelUrl: hueImperialEnvironment.modelUrl,
  scale: hueImperialEnvironment.scale,
  rotation: hueImperialEnvironment.rotation,
  position: hueImperialEnvironment.position,
  artifacts: [
    chenGomMeoThuanArtifact,
    tachTraCungDinhHueArtifact,
  ],
};

// ==========================================
// MẢNG TỔNG HỢP EXPORT CHÍNH
// ==========================================
export const culturalDestinationsData: CulturalDestinationModel[] = [
  thanhNhaHoDestination,
  phongTrungBayCoVatDestination,
  denThoBaTrieuDestination,
  kinhThanhHueDestination,
];

export default culturalDestinationsData;