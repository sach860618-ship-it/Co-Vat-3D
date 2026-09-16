import * as THREE from 'three';
import DestinationStatus from "./DestinationStatus";
import { ArtifactInfo } from '../Artifact/ArtifactInfo';
import { ArtifactPlacement } from '../Artifact/ArtifactPlacement';
import {
  tachTraNhatBanArtifact,
  tachCaPheHoangGiaArtifact,
  giaDoLyCoArtifact,
  tachCappuccinoCoArtifact,
  lySodaHuyenBiArtifact,
  coVatLoiPhongTrungBayArtifact,
  tachTraThanhNhaHoArtifact,
  deChenDongCoArtifact,
  coVatLoiThanhNhaHoArtifact,
  chenTraTeLeArtifact,
  binhGomDenBaTrieuArtifact,
  coVatLoiDenBaTrieuArtifact,
  chenGomMeoThuanArtifact,
  tachTraCungDinhHueArtifact,
  coVatLoiKinhThanhHueArtifact,
} from '../Artifact/artifactsData';

export * from '../Artifact';

// Bí danh tương thích ngược (Backward compatibility)
export type ArtifactModel = ArtifactPlacement;

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
  artifacts: ArtifactPlacement[];
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

// ==========================================
// 1. PHÒNG TRƯNG BÀY CỔ VẬT
// ==========================================
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
    new ArtifactPlacement(
      tachTraNhatBanArtifact,
      {
        position: new THREE.Vector3(0, 0, -4),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(5, 5, 5),
      },
      { color: 0xd97706 }
    ),
    new ArtifactPlacement(
      tachCaPheHoangGiaArtifact,
      {
        position: new THREE.Vector3(-6, 1, -4),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(20, 20, 20),
      },
      { color: 0x059669 }
    ),
    new ArtifactPlacement(
      giaDoLyCoArtifact,
      {
        position: new THREE.Vector3(6, 0, -4),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
      },
      { color: 0x2563eb }
    ),
    new ArtifactPlacement(
      tachCappuccinoCoArtifact,
      {
        position: new THREE.Vector3(-5, 0, 3),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(20, 20, 20),
      },
      { color: 0x9333ea }
    ),
    new ArtifactPlacement(
      lySodaHuyenBiArtifact,
      {
        position: new THREE.Vector3(5, 0, 3),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(3, 3, 3),
      },
      { color: 0xec4899 }
    ),
    new ArtifactPlacement(
      coVatLoiPhongTrungBayArtifact,
      {
        position: new THREE.Vector3(0, 0, 4),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(2, 2, 2),
      },
      { color: 0xef4444 }
    ),
  ],
};

// ==========================================
// 2. DI TÍCH THÀNH NHÀ HỒ
// ==========================================
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
    new ArtifactPlacement(
      tachTraThanhNhaHoArtifact,
      {
        position: new THREE.Vector3(0, 0, -4),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(2, 2, 2),
      },
      { color: 0xb45309 }
    ),
    new ArtifactPlacement(
      deChenDongCoArtifact,
      {
        position: new THREE.Vector3(5, 0, -2),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(0.8, 0.8, 0.8),
      },
      { color: 0xd97706 }
    ),
    new ArtifactPlacement(
      coVatLoiThanhNhaHoArtifact,
      {
        position: new THREE.Vector3(-5, 0, -2),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
      },
      { color: 0xf59e0b }
    ),
  ],
};

// ==========================================
// 3. ĐỀN THỜ BÀ TRIỆU
// ==========================================
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
    new ArtifactPlacement(
      chenTraTeLeArtifact,
      {
        position: new THREE.Vector3(-4, 0, -3),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1.4, 1.4, 1.4),
      },
      { color: 0x047857 }
    ),
    new ArtifactPlacement(
      binhGomDenBaTrieuArtifact,
      {
        position: new THREE.Vector3(4, 0, -3),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1.2, 1.2, 1.2),
      },
      { color: 0x059669 }
    ),
    new ArtifactPlacement(
      coVatLoiDenBaTrieuArtifact,
      {
        position: new THREE.Vector3(0, 0, -3.5),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1.2, 1.2, 1.2),
      },
      { color: 0xd97706 }
    ),
  ],
};

// ==========================================
// 4. KINH THÀNH HUẾ
// ==========================================
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
    new ArtifactPlacement(
      chenGomMeoThuanArtifact,
      {
        position: new THREE.Vector3(0, 0, -4),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1.3, 1.3, 1.3),
      },
      { color: 0x7c3aed }
    ),
    new ArtifactPlacement(
      tachTraCungDinhHueArtifact,
      {
        position: new THREE.Vector3(-5, 0, -2),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1.2, 1.2, 1.2),
      },
      { color: 0xd97706 }
    ),
    new ArtifactPlacement(
      coVatLoiKinhThanhHueArtifact,
      {
        position: new THREE.Vector3(5, 0, -2),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1.2, 1.2, 1.2),
      },
      { color: 0xb45309 }
    ),
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