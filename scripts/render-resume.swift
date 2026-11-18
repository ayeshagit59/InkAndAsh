// Renders every page of public/resume.pdf to PNG at 240 dpi, about 2x the viewer width (macOS; no poppler needed).
// Usage: swift scripts/render-resume.swift public/resume.pdf media-src/resume
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let pdfURL = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2])
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
guard let doc = CGPDFDocument(pdfURL as CFURL) else { fatalError("can't open pdf") }
let scale: CGFloat = 240.0 / 72.0
for i in 1...doc.numberOfPages {
  let page = doc.page(at: i)!
  let box = page.getBoxRect(.cropBox)
  let w = Int(box.width * scale), h = Int(box.height * scale)
  let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                      space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
  ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
  ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
  ctx.scaleBy(x: scale, y: scale)
  ctx.translateBy(x: -box.minX, y: -box.minY)
  ctx.drawPDFPage(page)
  let img = ctx.makeImage()!
  let url = outDir.appendingPathComponent("resume-page-\(i).png")
  let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, img, nil)
  CGImageDestinationFinalize(dest)
  print("\(url.path) \(w)x\(h)")
}
