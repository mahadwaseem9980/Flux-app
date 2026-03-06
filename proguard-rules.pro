# Lumina Reading - Android ProGuard Rules
# Optimized for Material 3 Expressive & High-Performance Social Reading

# Standard ProGuard rules
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*

# Keep Material Components
-keep class com.google.android.material.** { *; }
-dontwarn com.google.android.material.**

# Keep Room Database
-keep class * extends androidx.room.RoomDatabase
-keep class * implements androidx.room.RoomDatabase$Callback
-keep class * extends androidx.room.Entity
-keep class * extends androidx.room.Dao

# Keep FolioReader / EpubLib (ePub Optimization)
-keep class com.folioreader.** { *; }
-dontwarn com.folioreader.**
-keep class nl.siegmann.epublib.** { *; }

# Keep Firebase / Supabase
-keep class com.google.firebase.** { *; }
-keep class io.supabase.** { *; }

# Security: Obfuscate everything else
-repackageclasses ''
-allowaccessmodification
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,EnclosingMethod
