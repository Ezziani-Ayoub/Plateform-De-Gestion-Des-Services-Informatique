package com.pgsi.dto;

import java.util.ArrayList;
import java.util.List;

public class ExcelImportResultDto {

    private int totalRows;
    private int successCount;
    private int skippedCount;
    private List<String> errors = new ArrayList<>();

    public ExcelImportResultDto() {}

    public ExcelImportResultDto(int totalRows, int successCount, int skippedCount, List<String> errors) {
        this.totalRows = totalRows;
        this.successCount = successCount;
        this.skippedCount = skippedCount;
        this.errors = errors != null ? errors : new ArrayList<>();
    }

    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }

    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }

    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
}
