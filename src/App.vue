<script setup lang="ts">

import { ref, Ref, shallowRef } from "vue";
import { decrypter } from "./Decrypter";
import FileDropComponent from "./components/FileDropComponent.vue";

var password = ref("");
var salt = ref("");
var files: Ref<File[]> = shallowRef([]);
var decryptingIndex: Ref<number | null> = ref(null);
var downloadingIndex: Ref<number | null> = ref(null);

function handleFilesAdded(addedFiles: File[]) {
    files.value = [...files.value, ...addedFiles];
}

async function decryptFile(file: File, index: number) {
    decryptingIndex.value = index;
    try{
        await decrypter.decrypt(file, password.value, salt.value);
    } catch(e: any){
        console.error(e)
        var message = "Error: Could not decrypt file";
        if (e.toString() == "Error: Could not decrypt data"){
            message += ". Verify the encryption key is correct.";
        } else if (e.toString() == "Error: Magic is wrong"){
            message += ". It appears the file was not encrypted via rclone"
        }
        alert(message);
        return;
    } finally{ 
        if (decryptingIndex.value == index) {
            decryptingIndex.value = null;
        }
    }
    downloadingIndex.value = index
    setTimeout(() => {
        if (downloadingIndex.value == index) {
            downloadingIndex.value = null;
        }
    }, 2000);
}
function clearFile(index: number) {
    files.value = files.value.filter((_, i) => i != index);
}
function formatFileSize(size: number) {
    if (size === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, i)).toPrecision(3)} ${units[i]}`;
}
</script>

<template>
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0 8px 0;">
        <h3 style="margin: 0;">Rclone File Decrypter</h3>
        <small class="text-muted">
            <a href="https://github.com/Josh-TX/rclone-file-decrypter">github</a> | Created by Josh TX
        </small>
    </div>
    <FileDropComponent @filesAdded="handleFilesAdded" />
    <div class="input-container">
        <div style="flex: 1; padding-right: 8px; text-align: left; margin-top: 16px; ">
            <label>rclone encryption key</label>
            <br>
            <input v-model="password" style="width: 100%">
        </div>
        <div style="flex: 1; padding-right: 8px; text-align: left;  margin-top: 16px; ">
                <label>rclone encryption salt</label>
                <br>
                <input v-model="salt" style="width: 100%">
            </div>
    </div>
    <div v-if="files.length" style="margin-top: 32px">
        <div v-for="(file, index) in files" :key="index" class="file-info">
            <div class="nowrap" style="flex-shrink: 1; ">
                {{ file.name }}
                &nbsp;
                <span class="text-muted">({{ formatFileSize(file.size) }})</span>
            </div>
            <div class="nowrap">
                <button @click="decryptFile(file, index)">
                    <template v-if="decryptingIndex == index">Decrypting</template>
                    <template v-else-if="downloadingIndex == index">Downloading</template>
                    <template v-else>Download</template>
                </button>
                <button @click="clearFile(index)" style="margin-left: 12px;">&times</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.file-info {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #777;
    display: flex;

    align-items: center;
    justify-content: space-between;
}

.text-muted {
    color: #999;
}

.nowrap {
    white-space: nowrap;
    overflow: hidden;
}

.input-container{
    display: flex;
    gap: 16px;
}

@media (max-width: 600px) {
    .file-info {
        gap: 12px;
        flex-direction: column;
        /* Switch to column layout on smaller screens */
    }
    .input-container{
        flex-direction: column;
        gap: 0;
    }
}
</style>
