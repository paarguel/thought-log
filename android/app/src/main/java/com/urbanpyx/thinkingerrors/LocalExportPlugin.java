package com.urbanpyx.thinkingerrors;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Writes only to a destination explicitly chosen by the user. No storage permission. */
@CapacitorPlugin(name = "LocalExport")
public class LocalExportPlugin extends Plugin {
    private boolean exporting = false;

    @PluginMethod
    public void save(PluginCall call) {
        String filename = call.getString("filename");
        String content = call.getString("content");
        String mime = call.getString("mime");
        if (filename == null || content == null ||
            !("application/json".equals(mime) || "text/html".equals(mime))) {
            call.reject("Invalid export.");
            return;
        }
        if (exporting) {
            call.reject("An export is already open.");
            return;
        }
        exporting = true;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mime);
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        intent.putExtra(Intent.EXTRA_LOCAL_ONLY, true);
        try {
            startActivityForResult(call, intent, "saveResult");
        } catch (Exception error) {
            exporting = false;
            call.reject("Couldn't open the file picker.");
        }
    }

    @ActivityCallback
    private void saveResult(PluginCall call, ActivityResult result) {
        exporting = false;
        if (call == null) return;
        JSObject response = new JSObject();
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            response.put("saved", false);
            call.resolve(response);
            return;
        }
        getBridge().execute(() -> {
            try (OutputStream stream = getContext().getContentResolver().openOutputStream(result.getData().getData(), "wt")) {
                if (stream == null) throw new java.io.IOException("No output stream");
                stream.write(call.getString("content", "").getBytes(StandardCharsets.UTF_8));
            } catch (Exception error) {
                call.reject("Couldn't save the file. Your entries are still on this device.");
                return;
            }
            response.put("saved", true);
            call.resolve(response);
        });
    }
}
