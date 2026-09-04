import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { LightPreset, LIGHT_PRESETS } from '../components/LightingControlPanel';
import { EnvironmentModel } from '../../../models/Destination/CulturalDestinationModel';

export interface TourLightsTarget {
    scene?: THREE.Scene;
    hemiLight?: THREE.HemisphereLight;
    ambientLight?: THREE.AmbientLight;
    keyLight?: THREE.DirectionalLight;
    fillLight?: THREE.DirectionalLight;
    rimLight?: THREE.DirectionalLight;
}

export const useTourLighting = (environment?: EnvironmentModel) => {
    const initialLightMode = environment?.defaultLightPreset || 'daylight';
    const initialLightIntensity = environment?.defaultLightIntensity ?? 1.2;

    const [lightMode, setLightMode] = useState<LightPreset>(initialLightMode);
    const [lightIntensity, setLightIntensity] = useState<number>(initialLightIntensity);
    const [showLightMenu, setShowLightMenu] = useState<boolean>(false);

    const lightsRef = useRef<TourLightsTarget>({});

    // Gắn tham chiếu các đối tượng đèn từ Three.js scene
    const attachLights = useCallback((targets: TourLightsTarget) => {
        lightsRef.current = targets;
    }, []);

    // Dọn dẹp tham chiếu khi unmount scene
    const clearLights = useCallback(() => {
        lightsRef.current = {};
    }, []);

    // 1. Tự động cập nhật preset khi đổi địa điểm di tích
    useEffect(() => {
        if (!environment) return;
        setLightMode(environment.defaultLightPreset || 'daylight');
        setLightIntensity(environment.defaultLightIntensity ?? 1.2);
    }, [environment]);

    // 2. Đồng bộ các thông số Three.js mỗi khi người dùng đổi preset hoặc cường độ
    useEffect(() => {
        const { scene, hemiLight, ambientLight, keyLight, fillLight, rimLight } = lightsRef.current;
        if (!scene || !hemiLight || !ambientLight || !keyLight || !fillLight || !rimLight) return;

        const theme = LIGHT_PRESETS[lightMode];
        const mult = lightIntensity;

        hemiLight.color.setHex(theme.skyColor);
        hemiLight.groundColor.setHex(theme.groundColor);
        hemiLight.intensity = 1.0 * mult;

        ambientLight.color.setHex(theme.ambientColor);
        ambientLight.intensity = theme.ambientIntensity * mult;

        keyLight.color.setHex(theme.keyColor);
        keyLight.intensity = theme.keyIntensity * mult;

        fillLight.color.setHex(theme.fillColor);
        fillLight.intensity = theme.fillIntensity * mult;

        rimLight.color.setHex(theme.rimColor);
        rimLight.intensity = theme.rimIntensity * mult;

        scene.background = new THREE.Color(theme.bgColor);
        if (scene.fog) {
            (scene.fog as THREE.FogExp2).color.setHex(theme.fogColor);
        }
    }, [lightMode, lightIntensity]);

    return {
        lightMode,
        setLightMode,
        lightIntensity,
        setLightIntensity,
        showLightMenu,
        setShowLightMenu,
        attachLights,
        clearLights,
    };
};


// Trong useTourLighting.ts
export const setupTourLights = (scene: THREE.Scene, lightMode: LightPreset, lightIntensity: number): TourLightsTarget => {
    const theme = LIGHT_PRESETS[lightMode];
    const mult = lightIntensity;

    const hemiLight = new THREE.HemisphereLight(theme.skyColor, theme.groundColor, 1.0 * mult);
    const ambientLight = new THREE.AmbientLight(theme.ambientColor, theme.ambientIntensity * mult);

    const keyLight = new THREE.DirectionalLight(theme.keyColor, theme.keyIntensity * mult);
    keyLight.position.set(18, 30, 18);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0001;

    const fillLight = new THREE.DirectionalLight(theme.fillColor, theme.fillIntensity * mult);
    fillLight.position.set(-18, 15, -18);

    const rimLight = new THREE.DirectionalLight(theme.rimColor, theme.rimIntensity * mult);
    rimLight.position.set(0, 12, -22);

    scene.add(hemiLight, ambientLight, keyLight, fillLight, rimLight);
    return { scene, hemiLight, ambientLight, keyLight, fillLight, rimLight };
};