//
//  ViewController.swift
//  SecondApp
//
//  Created by Ahmet Hakan Altıparmak on 6.08.2024.
//

import UIKit

class ViewController: UIViewController {
    
    
    @IBOutlet weak var result: UILabel!
    @IBOutlet weak var textField1: UITextField!
    @IBOutlet weak var textField2: UITextField!
    var sonuc = 0.0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    }
    @IBAction func sumClicked(_ sender: Any) {
        if let firstNumber = Double(textField1.text!){
            if let secondNumber = Double(textField2.text!){
                sonuc = firstNumber + secondNumber
                result.text = String(sonuc)
            }
        }
    }
    
    @IBAction func minusClicked(_ sender: Any) {
        if let firstNumber = Double(textField1.text!){
            if let secondNumber = Double(textField2.text!){
                sonuc = firstNumber - secondNumber
                result.text = String(sonuc)
            }
        }
    }
    
    
    @IBAction func multiplyClicked(_ sender: Any) {
        if let firstNumber = Double(textField1.text!){
            if let secondNumber = Double(textField2.text!){
                sonuc = firstNumber * secondNumber
                result.text = String(sonuc)
            }
        }
    }
    
    
    @IBAction func divideClicked(_ sender: Any) {
        if let firstNumber = Double(textField1.text!){
            if let secondNumber = Double(textField2.text!){
                sonuc = firstNumber / secondNumber
                result.text = String(sonuc)
            }
        }
    }
}


