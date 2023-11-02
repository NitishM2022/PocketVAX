package com.pocketvax;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "PocketVax";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    checkPermissions();
  }

  public  boolean checkPermissions() {
    Log.e("inside permssion", "function");
    if (Build.VERSION.SDK_INT >= 23) {
      if (checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
                      == PackageManager.PERMISSION_GRANTED) {
        Log.v("TAG","Permission is granted");
        return true;
      } else {

        Log.v("TAG","Permission is revoked");
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, 1);
        return false;
      }
    }
    else { //permission is automatically granted on sdk<23 upon installation
      Log.v("TAG","Permission is granted");
      return true;
    }
  }

}
