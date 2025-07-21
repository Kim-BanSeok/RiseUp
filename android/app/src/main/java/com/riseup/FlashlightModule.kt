package com.riseup

import android.content.Context
import android.hardware.camera2.CameraManager
import android.os.Build
import com.facebook.react.bridge.*

class FlashlightModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FlashlightModule"
    }

    @ReactMethod
    fun turnOnFlashlight(promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            promise.reject("FLASHLIGHT_ERROR", "Android 6.0 이상이 필요합니다")
            return
        }
        
        try {
            val cameraManager = reactApplicationContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val cameraId = getCameraId(cameraManager)
            
            if (cameraId != null) {
                cameraManager.setTorchMode(cameraId, true)
                promise.resolve(true)
            } else {
                promise.reject("FLASHLIGHT_ERROR", "카메라를 찾을 수 없습니다")
            }
        } catch (e: Exception) {
            promise.reject("FLASHLIGHT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun turnOffFlashlight(promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            promise.reject("FLASHLIGHT_ERROR", "Android 6.0 이상이 필요합니다")
            return
        }
        
        try {
            val cameraManager = reactApplicationContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val cameraId = getCameraId(cameraManager)
            
            if (cameraId != null) {
                cameraManager.setTorchMode(cameraId, false)
                promise.resolve(true)
            } else {
                promise.reject("FLASHLIGHT_ERROR", "카메라를 찾을 수 없습니다")
            }
        } catch (e: Exception) {
            promise.reject("FLASHLIGHT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun isFlashlightAvailable(promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            promise.resolve(false)
            return
        }
        
        try {
            val cameraManager = reactApplicationContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val cameraId = getCameraId(cameraManager)
            promise.resolve(cameraId != null)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    private fun getCameraId(cameraManager: CameraManager): String? {
        return try {
            cameraManager.cameraIdList.find { id ->
                val characteristics = cameraManager.getCameraCharacteristics(id)
                val flashAvailable = characteristics.get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE)
                flashAvailable == true
            }
        } catch (e: Exception) {
            null
        }
    }
} 