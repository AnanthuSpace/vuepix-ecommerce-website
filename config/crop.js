// const sharp = require('sharp')
// const fs = require('fs')

// module.exports = {
//   crop: (req) => {
//     for (let i = 0; i < req.files.length; i++) {
//       const inputFilePath = req.files[i].path;
//       const cropRegion = {
//         left: 100,
//         top: 100,
//         width: 3600,
//         height: 2400,
//       };

//       // Use sharp to read the input image
//       sharp(inputFilePath)
//         .resize(3600, 2400)
//         .toBuffer((err, processedImageBuffer) => {
//           if (err) {
//             console.error('Error while cropping the image:', err);
//             return err;
//           } else {
//             fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
//               if (writeErr) {
//                 console.error('Error while saving the processed image:', writeErr);
//               } else {
//                 console.log('Image cropped and saved successfully to:', inputFilePath);
//                 return;
//               }
//             });
//           }
//         });
//     }
//   }
// }

const sharp = require('sharp');
const fs = require('fs').promises;  // Use fs.promises for promise-based file operations

module.exports = {
  crop: async (req) => {
    try {
      // Use Promise.all to wait for all asynchronous operations to complete
      await Promise.all(req.files.map(async (file) => {
        const inputFilePath = file.path;
        const cropRegion = {
          left: 100,
          top: 100,
          width: 3600,
          height: 2400,
        };

        // Use sharp to read the input image
        const processedImageBuffer = await sharp(inputFilePath)
          .resize(3600, 2400)
          .toBuffer();

        // Use fs.promises.writeFile for promise-based file writing
        await fs.writeFile(inputFilePath, processedImageBuffer);

        console.log('Image cropped and saved successfully to:', inputFilePath);
      }));

    } catch (error) {
      console.error('Error while cropping or saving images:', error);
    }
  }
};
