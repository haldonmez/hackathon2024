//
//  FeedCell.swift
//  InstaCloneFirebase
//
//  Created by Ahmet Hakan Altıparmak on 9.09.2024.
//

import UIKit
import FirebaseFirestore

class FeedCell: UITableViewCell {

    @IBOutlet weak var userEmailText: UILabel!
    @IBOutlet weak var likeLabel: UILabel!
    @IBOutlet weak var documentLabel: UILabel!
    @IBOutlet weak var userİmageView: UIImageView!
    @IBOutlet weak var commentLabel: UILabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
    @IBAction func likeButtonClicked(_ sender: Any) {
        
        let fireStoreDatabase = Firestore.firestore()
        
        
        if let likeCount = Int(likeLabel.text!)
        {
            
            let likeStore = ["likes" : likeCount + 1] as [String : Any]
             
            
            fireStoreDatabase.collection("Posts").document(documentLabel.text!).setData(likeStore, merge: true)

        }
        
    }
    
}
