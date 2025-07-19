package com.riseup

import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import java.util.*

class AlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AlarmModule"
    }

    @ReactMethod
    fun checkAlarmPermission(promise: Promise) {
        try {
            val context = reactApplicationContext
            val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                alarmManager.canScheduleExactAlarms()
            } else {
                true // Android 12 미만에서는 항상 true
            }
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "권한 확인 실패: ${e.message}")
        }
    }

    @ReactMethod
    fun requestAlarmPermission(promise: Promise) {
        try {
            val context = reactApplicationContext
            val currentActivity = currentActivity
            
            if (currentActivity == null) {
                promise.reject("ACTIVITY_ERROR", "현재 액티비티를 찾을 수 없습니다")
                return
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // Android 12+ 에서는 설정 앱으로 이동
                val intent = Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                intent.data = android.net.Uri.parse("package:${context.packageName}")
                currentActivity.startActivity(intent)
                promise.resolve("권한 요청 화면으로 이동했습니다")
            } else {
                promise.resolve("Android 12 미만에서는 권한이 자동으로 허용됩니다")
            }
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", "권한 요청 실패: ${e.message}")
        }
    }

    @ReactMethod
    fun setAlarm(
        alarmId: String,
        timeInMillis: Double,
        title: String,
        message: String,
        promise: Promise
    ) {
        try {
            val context = reactApplicationContext
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            
            // 권한 확인
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (!alarmManager.canScheduleExactAlarms()) {
                    promise.reject("PERMISSION_ERROR", "정확한 알람 권한이 필요합니다. 설정에서 권한을 허용해주세요.")
                    return
                }
            }
            
            val intent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra("alarmId", alarmId)
                putExtra("title", title)
                putExtra("message", message)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                alarmId.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // 정확한 시간에 알람 설정
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    timeInMillis.toLong(),
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    timeInMillis.toLong(),
                    pendingIntent
                )
            }

            promise.resolve("알람 설정 성공: $alarmId")
        } catch (e: Exception) {
            promise.reject("ALARM_ERROR", "알람 설정 실패: ${e.message}")
        }
    }

    @ReactMethod
    fun cancelAlarm(alarmId: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            
            val intent = Intent(context, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                alarmId.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            alarmManager.cancel(pendingIntent)
            promise.resolve("알람 취소 성공: $alarmId")
        } catch (e: Exception) {
            promise.reject("ALARM_ERROR", "알람 취소 실패: ${e.message}")
        }
    }
} 