package com.pgsi.service;

import com.pgsi.dto.ExcelImportResultDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ExcelImportService {
    ExcelImportResultDto importEquipments(MultipartFile file);
    byte[] generateTemplate() throws IOException;
}
