const path = require("path");
const fs = require("fs");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const Jimp = require("jimp");

const responseFormatter = require("../helpers/responseFormatter");
const { Employee } = require("../models");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

class RecognitionController {
 static faceMatcher = async (req, res) => {
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromDisk("public/models");
      await faceapi.nets.faceLandmark68Net.loadFromDisk("public/models");
      await faceapi.nets.faceRecognitionNet.loadFromDisk("public/models");

      const { id } = req.params;
      const employee = await Employee.findByPk(id, {
        attributes: ["photo"],
      });

      if (!employee) {
        return res.status(404).json(responseFormatter.error(null, "Employee not found", res.statusCode));
      }
      
      // Detect Reference Image
      const referenceImage = await canvas.loadImage(employee.photo);
      const resultRef = await faceapi.detectSingleFace(referenceImage)
                              .withFaceLandmarks()
                              .withFaceDescriptor();
      
      if(!resultRef) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            return err
          }
        });

        return res.status(404).json(responseFormatter.success({score: "1"}, "Your face not detected", res.statusCode));
      }

      // Create Face Matcher
      const faceMatcher = new faceapi.FaceMatcher(resultRef, 0.5);

      // mirror image
      Jimp.read(req.file.path).then(image => {
        image.flip(true, false).write(`public/img/processing/${req.file.filename.split('.')[0]}-mirror.jpg`);
      }).then(() => {
        setTimeout(async () => {
          // Detect Request Image
          const requestImage = await canvas.loadImage(`public/img/processing/${req.file.filename.split('.')[0]}-mirror.jpg`);
          const resultReq = await faceapi.detectAllFaces(requestImage)
                                  .withFaceLandmarks()
                                  .withFaceDescriptors();

          fs.unlink(`public/img/processing/${req.file.filename.split('.')[0]}-mirror.jpg`, (err) => {
            if (err) {
              return err
            }
          });

          if(resultReq.length < 1) {
            fs.unlink(req.file.path, (err) => {
              if (err) {
                return err
              }
            });

            return res.status(404).json(responseFormatter.success({score: "1"}, "Your face not detected", res.statusCode));
          }
                  
          // Matching
          const resultMatch =  resultReq.map(res => {
            const bestMatch = faceMatcher.findBestMatch(res.descriptor);

            return {
              label: bestMatch._label,
              distance: bestMatch._distance.toFixed(2),
            }
          })

          // Filter Result
          const finalResult = resultMatch.filter(match => {
            return match.label !== "unknown" && match.distance < 0.5
          })

          fs.unlink(req.file.path, (err) => {
            if (err) {
              return err
            }
          });

          if(finalResult.length < 1) {
            return res.status(404).json(responseFormatter.success({score: "1"}, "Your face not match", res.statusCode));
          }

          const percentage = ((1 - finalResult[0].distance) * 100).toFixed(0);
          return res.status(200).json(responseFormatter.success({score: percentage}, "Your face match", res.statusCode));
        }, 200);
      })      

    } catch (error) {
      return res.status(500).json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = RecognitionController;