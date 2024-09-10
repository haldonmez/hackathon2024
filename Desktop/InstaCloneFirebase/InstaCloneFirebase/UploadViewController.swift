    import UIKit
    import FirebaseFirestoreInternal
    import FirebaseStorage
    import FirebaseAuth


    class UploadViewController: UIViewController, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        
        @IBOutlet weak var commentField: UITextField!
        @IBOutlet weak var imageView: UIImageView!
        
        
        @IBOutlet weak var uploadButton: UIButton!
        
        override func viewDidLoad() {
            super.viewDidLoad()
            
            // Görsel seçmek için imageView'a tıklama özelliği ekleyin.
            imageView.isUserInteractionEnabled = true
            let gestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(selectImageSource))
            imageView.addGestureRecognizer(gestureRecognizer)
        }
        
        @objc func selectImageSource() {
            let alertController = UIAlertController(title: "Fotoğraf Seç", message: "Nereden fotoğraf yüklemek istiyorsunuz?", preferredStyle: .actionSheet)
            
            // Galeriden Seçenek
            let galleryAction = UIAlertAction(title: "Galeriden Seç", style: .default) { _ in
                self.openImagePicker(sourceType: .photoLibrary)
            }
            
            // Kameradan Seçenek
            let cameraAction = UIAlertAction(title: "Kameradan Çek", style: .default) { _ in
                self.openImagePicker(sourceType: .camera)
            }
            
            // İptal Seçeneği
            let cancelAction = UIAlertAction(title: "İptal", style: .cancel, handler: nil)
            
            alertController.addAction(galleryAction)
            alertController.addAction(cameraAction)
            alertController.addAction(cancelAction)
            
            present(alertController, animated: true, completion: nil)
        }
        
        func openImagePicker(sourceType: UIImagePickerController.SourceType) {
            if UIImagePickerController.isSourceTypeAvailable(sourceType) {
                let pickerController = UIImagePickerController()
                pickerController.delegate = self
                pickerController.sourceType = sourceType
                pickerController.allowsEditing = true
                present(pickerController, animated: true, completion: nil)
            } else {
                // Cihazda kamera yoksa veya galeriye erişilemiyorsa kullanıcıya uyarı göster
                let alert = UIAlertController(title: "Hata", message: "Bu seçeneğe erişilemiyor.", preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: "Tamam", style: .default, handler: nil))
                present(alert, animated: true, completion: nil)
            }
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let chosenImage = info[.originalImage] as? UIImage {
                imageView.image = chosenImage
            }
            dismiss(animated: true, completion: nil)
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            dismiss(animated: true, completion: nil)
        }
        
        func makeAlert(titleInput : String, messageInput : String)
        {
            let alert = UIAlertController(title: titleInput, message: messageInput, preferredStyle: UIAlertController.Style.alert)
            let okButton = UIAlertAction(title: "OK", style: UIAlertAction.Style.default, handler: nil)
            alert.addAction(okButton)
            self.present(alert, animated: true, completion: nil)
        }
        
        
        @IBAction func actionButtonClicked(_ sender: Any) {
            // Kaydetme işlemleri burada yapılacak
            let storage = Storage.storage()
            let storageReference = storage.reference()
            
            let uuid = UUID().uuidString
            
            let mediaFolder = storageReference.child("media")
            
            if let data = imageView.image?.jpegData(compressionQuality: 0.5)
            {
                let imageReference = mediaFolder.child("\(uuid).jpg")
                imageReference.putData(data, metadata: nil) { (metadata, error) in
                    if error != nil {
                        self.makeAlert(titleInput: "Error!", messageInput: error!.localizedDescription)
                    }
                    else {
                        imageReference.downloadURL { (url, error) in
                            if error == nil
                            {
                                let imageUrl = url?.absoluteString
                                
                                
                                //DATABASE
                                
                                let firestoreDatabase = Firestore.firestore()
                                
                                var firestoreReference : DocumentReference? = nil
                                
                                let firestorePost = ["imageUrl" : imageUrl!, "postedBy" : Auth.auth().currentUser!.email!, "postComment" : self.commentField.text!,"date" : FieldValue.serverTimestamp(), "likes" : 0 ] as [String : Any]
                                
                                firestoreReference = firestoreDatabase.collection("Posts").addDocument(data: firestorePost, completion: { (error) in
                                    if error != nil {
                                        
                                        self.makeAlert(titleInput: "Error!", messageInput: error?.localizedDescription ?? "Error")
                                        
                                    } else {
                                        
                                        self.imageView.image = UIImage(named: "select.png")
                                        self.commentField.text = ""
                                        self.tabBarController?.selectedIndex = 0
                                        
                                    }
                                })
                            }
                        }
                    }
                    
                }
            }
        }
    }
