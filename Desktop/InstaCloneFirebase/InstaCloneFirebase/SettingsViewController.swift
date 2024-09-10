//
//  SettingsViewController.swift
//  InstaCloneFirebase
//
//  /Users/hakods/Desktop/InstaCloneFirebase/InstaCloneFirebase/UploadViewController.swiftCreated by Ahmet Hakan Altıparmak on 2.09.2024.
//

import UIKit
import FirebaseAuth

class SettingsViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

    }
    
    @IBAction func logoutClicked(_ sender: Any) {
        do{
            try Auth.auth().signOut()
            self.performSegue(withIdentifier: "toViewController", sender: nil)
        }catch
        {
            print("Error")
        }
    }
    
    

}
