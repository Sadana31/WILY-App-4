import * as React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, 
ToastAndroid, TextInput,
Image, Alert, KeyboardAvoidingView} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {

    constructor(){
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            buttonState: "normal",
            scannedData: "",
            scannedBookId: "",
            scannedStudentId: "",
            transactionMessage: ""
        }
    }

    handleBarCodeScanned=async({type,data})=>{
        const {buttonState} = this.state;
        if(buttonState==="BookId"){
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState: "normal",
            })
        }
        else if(buttonState==="StudentId"){
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: "normal",
            })
        }
    }

    getCameraPermissions=async(id)=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        
       this.setState({
            /* status==="granted" is True when user has granted permissions
            status==="granted" is False when user has not granted permissions */
            hasCameraPermissions: status==="granted",
            buttonState: id,
            scanned: false,            
       })
    }

    handleTransaction=()=>{
        var transactionMessage;
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc)=>{
            console.log(doc.data());
            var book = doc.data();
            if(book.bookAvailability){
                this.initiateBookIssue();
                transactionMessage = "Book Issued"
                ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);
            }
            else {
                this.initiateBookReturn();
                transactionMessage = "Book Returned"
                ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);
            }
        })
        this.setState({transactionMessage: transactionMessage});
    }

    initiateBookIssue=()=>{
        //add a transaction
        db.collection("transactions").add({
            "studentId": this.state.scannedStudentId,
            "bookId": this.state.scannedBookId,
            "date": firebase.firestore.Timestamp.now().toDate(),
            "transactionType": "Issued"
        })
        //change the status
        db.collection("books").doc(this.state.scannedBookId).update({
           "bookAvailability": false,
        })
        //change the no. of books issued to a student
        db.collection("students").doc(this.state.scannedStudentId).update({
            "numberOfBooksIssued": firebase.firestore.FieldValue.increment(1),
         })
        //Alert.alert("Book Issued");
        this.setState({scannedBookId: "", scannedStudentId: ""});
    }

    initiateBookReturn=()=>{
        //add a transaction
        db.collection("transactions").add({
            "studentId": this.state.scannedStudentId,
            "bookId": this.state.scannedBookId,
            "date": firebase.firestore.Timestamp.now().toDate(),
            "transactionType": "Returned"
        })
        //change the status
        db.collection("books").doc(this.state.scannedBookId).update({
           "bookAvailability": true,
        })
        //change the no. of books issued to a student
        db.collection("students").doc(this.state.scannedStudentId).update({
            "numberOfBooksIssued": firebase.firestore.FieldValue.increment(-1),
         })
        //Alert.alert("Book Returned");
        this.setState({scannedBookId: "", scannedStudentId: ""});
    }
    
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if(buttonState!=="normal" && hasCameraPermissions){
            return(
                <BarCodeScanner 
                onBarCodeScanned={scanned ?undefined :this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}/>
            )
        }
        else if (buttonState==="normal"){
            return(
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                    <View>
                        <Image source={require("../assets/booklogo.jpg")}
                        style={{width: 200, height:200,}}/>
                        <Text style={{textAlign: "center", fontSize: 30}}>
                            WILY
                        </Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox}
                        placeholder="Book ID"
                        onChangeText={text=>this.setState({scannedBookId: text})}
                        value = {this.state.scannedBookId}/>
                        <TouchableOpacity style={styles.scanButton} 
                        onPress={()=>{
                            this.getCameraPermissions("BookId");
                        }}>
                            <Text style={styles.buttonText}>
                                SCAN
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox}
                        placeholder="Student ID"
                        onChangeText={text=>this.setState({scannedStudentId: text})}
                        value = {this.state.scannedStudentId}/>
                        <TouchableOpacity style={styles.scanButton}
                        onPress={()=>{
                            this.getCameraPermissions("StudentId");
                        }}>
                            <Text style={styles.buttonText}>
                                SCAN
                            </Text>
                        </TouchableOpacity>

                    </View>  
                    <TouchableOpacity style={styles.submitButton}
                    onPress={async()=>{
                        this.handleTransaction();
                    }}>
                        <Text style={styles.submitButtonText}>SUBMIT</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            )
        }
    }
}

const styles=StyleSheet.create({
    scanButton: {
        backgroundColor: "#2196f3",
        width: 50,
        borderWidth: 1.5
    },
    displayText: {
        fontSize:15,
        textDecorationLine: "underline",
    },
    container: {
        flex: 1,
         justifyContent: "center", 
         alignItems: "center"
    },
    buttonText: {
        fontSize:15,
        textDecorationLine: "underline",
        textAlign: "center",
        marginTop: 20,
    },
    inputView: {
        flexDirection: "row",
        margin: 20,
    },
    inputBox: {
        width: 200,
        height: 50,
        borderWidth: 1.5,
        fontSize: 20,
    },
    submitButton: {
        backgroundColor: "#FBC02D",
        width: 100,
        height: 50,
        borderRadius: 10,
    },
    submitButtonText:{
        padding: 10,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: "white"
    }
})