export class DownloadCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			download_progress: 0,
			downloaded: false,
			path: '',
		};
	}

	_openFile() {
		FileViewer.open(Platform.OS === 'android' ? 'file://' + this.state.path : '' + this.state.path)
			.then(() => {})
			.catch(error => {});
	}

	_downloadFile(url) {
		RNFetchBlob
			.config({
				path: RNFetchBlob.fs.dirs.DocumentDir + '/' + this.props.name + '.' + this.props.type.split('/')[1],
				fileCache: true,
				appendExt: this.props.type.split('/')[1],
			})
			.fetch('GET', url, {
				'Cache-Control': 'no-store',
			})
			.progress({ count: 1000 }, (received, total) => {
				this.state.download_progress = received / total * 100;
				this.forceUpdate();
				console.log('progress: ' + received / total * 100 + '%');
			})
			.then(res => {
				this.state.downloaded = true;
				this.state.path = res.path();
				this.forceUpdate();
			});
	}

	render() {
		var icon = faFile;
		if (this.props.type == 'application/pdf') icon = faFilePdf;
		if (this.props.type == 'application/msword') icon = faFileWord;
		if (this.props.type == 'application/mspowerpoint') icon = faFilePowerpoint;
		if (this.props.type == 'application/msexcel') icon = faFileExcel;
		if (this.props.type == 'application/pdf') icon = faFilePdf;
		if (this.props.type == 'application/zip') icon = faFileArchive;
		if (this.props.type == 'text/comma-separated-values	') icon = faFileCsv;

		if (!this.props.icon) {
			if (this.props.type.includes('audio')) icon = faFileAudio;
			if (this.props.type.includes('video')) icon = faFileVideo;
			if (this.props.type.includes('image')) icon = faFileImage;
			if (this.props.type.includes('text')) icon = faFileAlt;
		}

		var s = require('./style.js');
		return (
			<TouchableOpacity
				onPress={() => {
					if (!this.state.downloaded) this._downloadFile(this.props.download_url);
					else this._openFile();
				}}
			>
				<View
					style={{
						marginTop: 20,
						borderRadius: 13,
						padding: 10,
						backgroundColor: '#201A30',
						marginRight: 55,
						color: '#ADA4A9',
						flexWrap: 'wrap',
						alignItems: 'flex-start',
						flexDirection: 'row',
					}}
				>
					{!this.state.downloaded
						? <AnimatedCircularProgress
								size={41}
								width={6}
								style={{ position: 'absolute', marginTop: 13, marginLeft: 12 }}
								fill={this.state.download_progress}
								tintColor="#0DF5E3"
								onAnimationComplete={() => console.log('onAnimationComplete')}
								backgroundColor="#201A30"
							/>
						: void 0}

					<FontAwesomeIcon
						style={{ zIndex: 0, marginTop: 6, marginLeft: 5 }}
						size={35}
						color="#ADA4A9"
						icon={this.state.downloaded ? icon : faArrowAltCircleDown}
					/>

					<View style={{ marginLeft: 16 }}>
						<Text style={{ marginTop: 2, fontFamily: 'Poppins-SemiBold', fontSize: 23, color: '#ADA4A9' }}>
							{this.props.name}
						</Text>
						<Text style={{ marginTop: -6, fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#ADA4A9' }}>
							{Math.round(this.props.size / 1000000, 2)} MB
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}
