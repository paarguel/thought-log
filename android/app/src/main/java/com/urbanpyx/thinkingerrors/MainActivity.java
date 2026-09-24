package com.urbanpyx.thinkingerrors;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LocalExportPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
