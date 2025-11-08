package io.fliqa.hackaton.domain.model;

import jakarta.ws.rs.BadRequestException;

import javax.imageio.ImageIO;
import java.awt.color.ColorSpace;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import jakarta.ws.rs.InternalServerErrorException;


public class QrCode {

    private static final int QR_SIZE = 256;

    private final byte[] imageData;

    public QrCode(String qrData, InputStream superimposedImage) throws IOException {
        this(qrData, superimposedImage, QR_SIZE);
    }

    public QrCode(
            String qrData, InputStream superimposedImage, int size)
            throws IOException {

        if (qrData == null || qrData.isEmpty()) {
            throw new BadRequestException("qrData must not be empty");
        }

        var writer = new QRCodeWriter();
        var errorCorrectionToUse = ErrorCorrectionLevel.M;

        var hints = Map.of(EncodeHintType.ERROR_CORRECTION, errorCorrectionToUse);

        try (var output = new ByteArrayOutputStream()) {
            var qrCode = writer.encode(
                    qrData,
                    BarcodeFormat.QR_CODE,
                    size,
                    size,
                    hints);

            var renderedQrCode =
                    increaseColorDepth(MatrixToImageWriter.toBufferedImage(qrCode));

            if (superimposedImage != null) {
                var superimposed = scaleImage(0.2, size, ImageIO.read(superimposedImage));
                ImageIO.write(superImposeImage(renderedQrCode, superimposed), "png", output);
            } else {
                ImageIO.write(renderedQrCode, "png", output);
            }

            imageData = output.toByteArray();
        } catch (WriterException e) {
            throw new InternalServerErrorException("Failed to create QR code", e);
        }
    }

    private BufferedImage increaseColorDepth(BufferedImage image) {
        var result = new BufferedImage(
                image.getWidth(), image.getHeight(), ColorSpace.TYPE_RGB);

        for (int x = 0; x < image.getWidth(); x++) {
            for (int y = 0; y < image.getHeight(); y++) {
                result.setRGB(x, y, image.getRGB(x, y));
            }
        }
        return result;
    }

    private BufferedImage superImposeImage(
            BufferedImage baseImageData,
            BufferedImage superImposedImage) {

        var imageGraphics = baseImageData.createGraphics();
        var posX = (baseImageData.getWidth() - superImposedImage.getWidth()) / 2;
        var posY = (baseImageData.getHeight() - superImposedImage.getHeight()) / 2;
        imageGraphics.drawImage(superImposedImage, null, posX, posY);
        imageGraphics.dispose();

        return baseImageData;
    }

    private BufferedImage scaleImage(double scale, int originalSize, BufferedImage image) {
        int scaledWidth = Math.toIntExact(Math.round(originalSize * scale));
        int scaledHeight = Math.toIntExact(Math.round(originalSize * scale));

        var scaledImage = image.getScaledInstance(
                scaledWidth, scaledHeight, BufferedImage.SCALE_DEFAULT);

        var result = new BufferedImage(
                scaledWidth, scaledHeight, BufferedImage.TYPE_INT_RGB);
        result.getGraphics().drawImage(scaledImage, 0, 0, null);

        return result;
    }

    public byte[] getImageData() {
        return imageData;
    }

}
