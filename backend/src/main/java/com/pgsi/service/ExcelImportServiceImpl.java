package com.pgsi.service;

import com.pgsi.dto.ExcelImportResultDto;
import com.pgsi.entity.Equipment;
import com.pgsi.entity.EquipmentStatus;
import com.pgsi.exception.BadRequestException;
import com.pgsi.repository.EquipmentRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class ExcelImportServiceImpl implements ExcelImportService {

    private final EquipmentRepository equipmentRepository;

    public ExcelImportServiceImpl(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    @Transactional
    public ExcelImportResultDto importEquipments(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Veuillez fournir un fichier Excel valide.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.toLowerCase().endsWith(".xlsx") && !filename.toLowerCase().endsWith(".xls"))) {
            throw new BadRequestException("Format de fichier non pris en charge. Veuillez télécharger un fichier Excel (.xlsx ou .xls).");
        }

        int totalRows = 0;
        int successCount = 0;
        int skippedCount = 0;
        List<String> errors = new ArrayList<>();
        List<Equipment> equipmentsToSave = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getLastRowNum() < 1) {
                throw new BadRequestException("Le fichier Excel est vide ou ne contient aucune ligne de données.");
            }

            // Header mapping
            Row headerRow = sheet.getRow(0);
            Map<String, Integer> colMap = buildColumnMapping(headerRow);

            if (!colMap.containsKey("name") || !colMap.containsKey("serialNumber")) {
                throw new BadRequestException("Les colonnes obligatoires 'Nom' et 'Numéro de Série' doivent être présentes dans le fichier.");
            }

            DataFormatter formatter = new DataFormatter();

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || isRowEmpty(row, formatter)) {
                    continue; // Skip blank rows
                }

                totalRows++;
                int lineNumber = r + 1;

                String name = getCellValue(row, colMap.get("name"), formatter);
                String serialNumber = getCellValue(row, colMap.get("serialNumber"), formatter);
                String category = getCellValue(row, colMap.get("category"), formatter);
                String statusStr = getCellValue(row, colMap.get("status"), formatter);
                String location = getCellValue(row, colMap.get("location"), formatter);
                String description = getCellValue(row, colMap.get("description"), formatter);
                LocalDate purchaseDate = parseDateValue(row, colMap.get("purchaseDate"), formatter);

                // Validation
                if (name == null || name.isBlank()) {
                    errors.add("Ligne " + lineNumber + ": Le nom de l'équipement est requis.");
                    skippedCount++;
                    continue;
                }

                if (serialNumber == null || serialNumber.isBlank()) {
                    errors.add("Ligne " + lineNumber + ": Le numéro de série est requis pour '" + name + "'.");
                    skippedCount++;
                    continue;
                }

                if (equipmentRepository.existsBySerialNumber(serialNumber.trim())) {
                    errors.add("Ligne " + lineNumber + ": Le numéro de série '" + serialNumber.trim() + "' existe déjà dans le système.");
                    skippedCount++;
                    continue;
                }

                EquipmentStatus status = parseStatus(statusStr);
                String finalCategory = (category != null && !category.isBlank()) ? category.trim().toUpperCase() : "AUTRE";

                Equipment equipment = Equipment.builder()
                        .name(name.trim())
                        .serialNumber(serialNumber.trim())
                        .category(finalCategory)
                        .status(status)
                        .location(location != null ? location.trim() : null)
                        .purchaseDate(purchaseDate)
                        .description(description != null ? description.trim() : null)
                        .build();

                equipmentsToSave.add(equipment);
                successCount++;
            }

            if (!equipmentsToSave.isEmpty()) {
                equipmentRepository.saveAll(equipmentsToSave);
            }

        } catch (IOException e) {
            throw new BadRequestException("Erreur de lecture du fichier Excel: " + e.getMessage());
        }

        return new ExcelImportResultDto(totalRows, successCount, skippedCount, errors);
    }

    @Override
    public byte[] generateTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Modèle Équipements");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Headers
            String[] headers = {
                    "Nom *", "Numéro de Série *", "Catégorie", "Statut (AVAILABLE/IN_USE/MAINTENANCE)", "Emplacement", "Date d'achat (AAAA-MM-JJ)", "Description"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample Row 1
            Row sampleRow1 = sheet.createRow(1);
            sampleRow1.createCell(0).setCellValue("Dell Latitude 5540");
            sampleRow1.createCell(1).setCellValue("SN-DELL-998811");
            sampleRow1.createCell(2).setCellValue("LAPTOP");
            sampleRow1.createCell(3).setCellValue("AVAILABLE");
            sampleRow1.createCell(4).setCellValue("Stock DSI");
            sampleRow1.createCell(5).setCellValue("2024-01-15");
            sampleRow1.createCell(6).setCellValue("PC Portable Core i7 16GB RAM");

            // Sample Row 2
            Row sampleRow2 = sheet.createRow(2);
            sampleRow2.createCell(0).setCellValue("Imprimante HP LaserJet");
            sampleRow2.createCell(1).setCellValue("SN-HP-441100");
            sampleRow2.createCell(2).setCellValue("PRINTER");
            sampleRow2.createCell(3).setCellValue("IN_USE");
            sampleRow2.createCell(4).setCellValue("Bureau RH");
            sampleRow2.createCell(5).setCellValue("2023-06-20");
            sampleRow2.createCell(6).setCellValue("Imprimante réseau multifonction");

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private Map<String, Integer> buildColumnMapping(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();
        DataFormatter formatter = new DataFormatter();

        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell == null) continue;
            String text = formatter.formatCellValue(cell).trim().toLowerCase();

            if (text.contains("nom") || text.contains("name")) {
                map.put("name", i);
            } else if (text.contains("série") || text.contains("serie") || text.contains("serial")) {
                map.put("serialNumber", i);
            } else if (text.contains("catégorie") || text.contains("categorie") || text.contains("category")) {
                map.put("category", i);
            } else if (text.contains("statut") || text.contains("status")) {
                map.put("status", i);
            } else if (text.contains("emplacement") || text.contains("location")) {
                map.put("location", i);
            } else if (text.contains("achat") || text.contains("purchase") || text.contains("date")) {
                map.put("purchaseDate", i);
            } else if (text.contains("description")) {
                map.put("description", i);
            }
        }
        return map;
    }

    private String getCellValue(Row row, Integer colIndex, DataFormatter formatter) {
        if (colIndex == null) return null;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return null;
        String val = formatter.formatCellValue(cell).trim();
        return val.isEmpty() ? null : val;
    }

    private LocalDate parseDateValue(Row row, Integer colIndex, DataFormatter formatter) {
        if (colIndex == null) return null;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return null;

        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            Date date = cell.getDateCellValue();
            return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }

        String text = formatter.formatCellValue(cell).trim();
        if (text.isEmpty()) return null;

        try {
            return LocalDate.parse(text);
        } catch (Exception e) {
            return null;
        }
    }

    private EquipmentStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.isBlank()) return EquipmentStatus.AVAILABLE;
        String s = statusStr.trim().toUpperCase();
        if (s.contains("UTILIS") || s.contains("USE") || s.contains("AFFECT")) {
            return EquipmentStatus.IN_USE;
        } else if (s.contains("MAINTENANCE")) {
            return EquipmentStatus.MAINTENANCE;
        } else if (s.contains("REBUT") || s.contains("RETIRE")) {
            return EquipmentStatus.RETIRED;
        }
        return EquipmentStatus.AVAILABLE;
    }

    private boolean isRowEmpty(Row row, DataFormatter formatter) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                if (!formatter.formatCellValue(cell).trim().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }
}
